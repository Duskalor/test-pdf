import { pdf } from 'pdf-to-img';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

const getImage = async (document) => {
  const Buffers = [];

  for await (const image of document) {
    Buffers.push(image);
    break;
  }
  return Buffers[0];
};

const getSharpImage = async (image) => {
  const imageToSharp = sharp(image);
  // Obtener metadatos de la imagen para determinar su altura
  const metadata = await imageToSharp.metadata();
  const height = metadata.height;

  // Dividir la imagen en la mitad superior
  const data = await imageToSharp
    .extract({
      left: 0,
      top: 0,
      width: metadata.width,
      height: Math.floor(height / 4.5),
    })
    .toBuffer();

  return data;
};

async function main() {
  console.time('PDF Processing'); // Inicia el temporizador
  const document = await pdf(
    './datos/LP13692S-0132-0410-PTC-CPV-00011_REV0.pdf',
    { scale: 4 }
  );

  const firstImage = await getImage(document);
  const image = await getSharpImage(firstImage);

  const { data } = await Tesseract.recognize(image, 'spa');
  console.log(data.text);
  console.timeEnd('PDF Processing');
}
main();
