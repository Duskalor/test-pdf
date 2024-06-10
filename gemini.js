import { pdf } from 'pdf-to-img';
import { getImage, getSharpImage } from './app.js';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// OpenAI API Key
const API_KEY_GEMINI = process.env.API_KEY_GEMINI;

const prompt = `puedes extraer datos q esta justo a la derecha de los texto q te pasare  

TITULO:
AREA DE TRABAJO:
DESCRIPCION:
ACTIVIDAD:

de la imagen y pasarlo a json ??
el titulo es el texto más grande`;

async function extractDataFromPdfWithGemini() {
  const document = await pdf(
    './datos/LP13692S-0132-0410-PTC-CFU-00028_REV0.pdf',
    { scale: 3 }
  );
  const firstImage = await getImage(document);
  const image = await getSharpImage(firstImage);
  const base64Image = image.toString('base64');

  // GEMINIS
  const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  // const { response } = await model.generateContent(['hola']);
  const { response } = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType: 'image/png' } },
  ]);
  // console.log(response);
  const text = response.text();
  console.log(text);
}

extractDataFromPdfWithGemini();
