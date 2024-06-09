import { pdf } from 'pdf-to-img';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { toXlsx } from './toxlsx.js';

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

const buscarTexto = (texto, valores) => {
  for (var i = 0; i < valores.length; i++) {
    if (texto.includes(valores[i])) {
      return valores[i];
    }
  }
  return 'Ninguno de los valores está presente en el texto.';
};

const titles = {
  FUNDACION: 'PROTOCOLO DE FUNDACION',
  VACIADO: 'PROTOCOLO DE PRE VACIADO',
};

async function main() {
  console.time('PDF Processing'); // Inicia el temporizador
  const document = await pdf(
    './datos/LP13692S-0132-0410-PTC-CFU-00029_REV0.pdf',
    { scale: 5 }
  );

  const firstImage = await getImage(document);
  const image = await getSharpImage(firstImage);

  const {
    data: { text },
  } = await Tesseract.recognize(image, 'spa');

  const valueee = buscarTexto(text, Object.keys(titles));

  const firstTitle = titles[valueee];
  console.log(text);
  console.log({ firstTitle });

  const regexArea = /AREA DE TRABAJO:\s*([^\n]+)/;
  const matchArea = regexArea.exec(text);
  const value = matchArea.toString().split(' FECHA: ');
  const areaTrabajo = value[0];
  const fecha = value.pop();
  //  continuar
  const regexDesc = /DESCRIPCIÓN:\s*([^\n]+)/;
  const matchDes = regexDesc.exec(text)[0];
  const descripcion = matchDes.split(' ELABORADO POR:').shift();

  const regexActiv = /ACTIVIDAD:\s*([^\n]+)/;
  const actividad = regexActiv.exec(text)[0];

  let title = `${firstTitle}-${areaTrabajo}-${descripcion}-${actividad}`;

  return;
  let commen = '';
  if (title.length > 255) {
    title.slice(0, 255);
    commen = title.split('-').pop();
  }
  const finalJson = {
    'Nro de Documento': '',
    Revisión: 0,
    Título: `${title} - ${areaTrabajo} - ${descripcion} - ${actividad}`,
    tipo: 'PROTOCOLO',
    Status: 'EMITIDO PARA INFORMACIÓN',
    Disciplina: '',
    'Nombre del proyecto': 'LP13692S - FIRENO Ferrobamba fase 5 infra',
    'Facilites Code Lb': '0131 - Fuel & Lube Storage & Dispensing',
    'Facilites Code CB': 'N/A',
    'Área Funcional': 'N/A',
    'Oc o Contrato': 'CW2253271',
    'Deliverable Class': 'SUPPLIER DOCS',
    'PPM Código': '5200P-013692 - Pit FB Phase 7 Infrastructure',
    Atributo1: '',
    Archivo: '',
    'Tamaño de impresión': '',
    'Fecha de emisión': fecha.split(': ').pop(),
    'Fecha del hito': '',
    'Fecha prevista de envio': '',
    'Fecha de reporte Diario': '',
    Autor: 'FIRENO S.A.C.',
    Comentarios: commen,
    'N° Tag/Equipo': '',
    Sustituir: '',
  };
  console.log(finalJson);
  toXlsx([finalJson]);
  console.timeEnd('PDF Processing');
}
main();
