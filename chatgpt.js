import { pdf } from 'pdf-to-img';
import 'dotenv/config';
// import { fileTypeFromBuffer } from 'file-type';
import { getImage, getSharpImage } from './app.js';
// OpenAI API Key
const API_KEY_CHATGPT = process.env.API_KEY_CHATGPT;

// sharp(image).toFile('output.png');

async function getCompletion(prompt) {
  const document = await pdf(
    './datos/LP13692S-0132-0410-PTC-CFU-00029_REV0.pdf',
    { scale: 2 }
  );

  const firstImage = await getImage(document);
  const image = await getSharpImage(firstImage);

  // const type = await fileTypeFromBuffer(image);
  // console.log({ type });
  // return;
  const base64Image = image.toString('base64');
  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY_CHATGPT}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',

      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      // max_tokens: 20,
    }),
  });

  const data = await response.json();
  // console.log(data)
  return data;
}
// const prompt = `
// Quiero que proceses una imagen que te enviaré son unas tablas saca la información de ahi y generes un archivo JSON que contenga la siguiente información:

// titulo: es el texto más grande de la imagen.
// Area_de_trabajo: esta a la derecha del campo "AREA DE TRABAJO:" .
// Descripcion: esta a la derecha del campo "DESCRIPCION:".
// Actividad: esta a la derecha del campo "ACTIVIDAD:".
// Fecha : Esta en el documento

// copia exacto de la imagen
// y devuelveme la imagen
// `;

const prompt = `devuelveme el texto de la imagen`;

const testApiOpen = async () => {
  const response = await getCompletion(prompt);
  console.log(response.choices[0].message);
};
testApiOpen();
