const { db } = require('../models/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

exports.clientRecommendation = async (req, res) => {
  const { restaurantId, format } = req.body;

  try {
    const clientId = req.cookies.clientId;

    // 1. Buscar até 100 avaliações recentes
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        `SELECT reviewer_name, rating, review_text
         FROM reviews
         WHERE restaurant_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
        [restaurantId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // 2. Tags do restaurante e do cliente (código sem alterações)
    const restaurant = await new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM restaurants WHERE id = ?',
        [restaurantId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    const restaurantTags = restaurant?.tags
      ? restaurant.tags.split(',').map(t => t.trim())
      : [];

    const client = await new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM clients WHERE id = ?',
        [clientId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    const clientTags = client?.tags
      ? client.tags.split(',').map(t => t.trim())
      : [];

    // 3. Montar prompt
    // Nomes dos avaliadores foram removidos para garantir o anonimato
    const reviewTexts = reviews
      .map(r => `- Nota ${r.rating}/5: "${r.review_text || 'Sem comentário.'}"`)
      .join('\n');
    
    const prompt = `
# INSTRUÇÕES PARA O ASSISTENTE DE IA

## FUNÇÃO
Você é um assistente de análise de dados. Sua tarefa é sintetizar as informações fornecidas e gerar um resumo em primeira pessoa para me ajudar a decidir se devo visitar este restaurante. A análise deve ser totalmente impessoal e anônima, sem mencionar nomes de outros usuários. O tom deve ser o de uma conclusão lógica e factual, sem usar verbos de preferência pessoal (como "adoro", "aprecio", "odeio").

## CONTEXTO
* **Meus Interesses:** ${clientTags.join(', ') || 'Nenhum informado'}
* **Especialidades do Restaurante:** ${restaurantTags.join(', ') || 'Nenhuma informada'}
* **Avaliações Anônimas:**
${reviewTexts || 'Nenhuma avaliação disponível.'}

## TAREFA E CRITÉRIOS
Com base no CONTEXTO, gere um resumo que me ajude a tomar uma decisão. Siga estes critérios:
1.  **Compatibilidade de Interesses:** A correspondência entre "Meus Interesses" e as "Especialidades do Restaurante" é o fator principal.
2.  **Análise das Avaliações:** Avalie o sentimento geral das avaliações.
3.  **Balanço:** Se a compatibilidade de interesses for alta, pontos de atenção menores podem ser relevados. Se a compatibilidade for baixa, as avaliações precisam ser excelentes.
4.  **Identificação de Alertas Críticos:** Problemas relacionados à **ambiente, limpeza, segurança alimentar ou tratamento desrespeitoso** devem ser tratados como de alta prioridade e destacados negativamente na sua análise, independentemente da compatibilidade de interesses.

## FORMATO DA RESPOSTA
Sua resposta deve seguir estritamente este formato Markdown, sem nenhuma introdução ou texto adicional e seja sempre impessoal:

Compatibilidade: (Responda com apenas uma das três opções: Compatível, Não Compatível, ou Parcialmente Compatível, finalizando a frase com um ponto final seguido de um espaço.)
Análise: (Uma frase objetiva e factual. Ex: "A compatibilidade de interesses é alta, mas os pontos de atenção sobre o serviço exigem cautela, finalizando a frase com um ponto final seguido de um espaço.")
Pontos Positivos: (Liste 1 ou 2 pontos fortes em formato de lista. Ex: "- Ambiente e decoração", finalizando a frase com um ponto final seguido de um espaço.)
Pontos Negativos: (Liste 1 ou 2 pontos fracos em formato de lista. Ex: "- Serviço pode ser lento", finalizando a frase com um ponto final seguido de um espaço.)

## REGRA ESPECIAL
Se a seção "Avaliações Anônimas" estiver vazia, sua única resposta deve ser: **Este restaurante ainda não possui avaliações. Não é possível gerar uma análise detalhada.**
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Chave da API do Gemini não configurada no .env.'
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
    const result = await model.generateContent(prompt);
    const analysis = await result.response.text();

    // 4. Gerar PDF ou JSON (código sem alterações)
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="recomendacao_${restaurantId}.pdf"`
        );
        res.send(pdfData);
      });

      doc.fontSize(16).text('Análise Pessoal de Compatibilidade', {
        align: 'center',
      });
      doc.moveDown();
      doc.fontSize(12).text(`Restaurante ID: ${restaurantId}`);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
      doc.moveDown();
      doc.text(analysis, { lineGap: 4 });
      doc.end();
      return;
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || 'Erro interno ao gerar recomendação.' });
  }
};