const crypto = require('crypto');
const PDFDocument = require('pdfkit');

function generateCertificateCode() {
  return `EDU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function renderCertificatePdf({ studentName, courseTitle, issuedAt, code }, res) {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="certificado-${code}.pdf"`);
  doc.pipe(res);

  const width = doc.page.width;
  const height = doc.page.height;
  const primary = '#4F46E5';
  const dark = '#1E1B4B';
  const gold = '#D4A017';

  doc.rect(0, 0, width, height).fill('#FDFCFB');
  doc.lineWidth(3).strokeColor(primary).rect(24, 24, width - 48, height - 48).stroke();
  doc.lineWidth(1).strokeColor(gold).rect(34, 34, width - 68, height - 68).stroke();

  doc
    .fillColor(primary)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('EDUWEB', 0, 70, { align: 'center' });

  doc
    .fillColor(dark)
    .font('Helvetica-Bold')
    .fontSize(34)
    .text('Certificado de Conclusão', 0, 100, { align: 'center' });

  doc
    .fillColor('#4B5563')
    .font('Helvetica')
    .fontSize(14)
    .text('Certificamos que', 0, 165, { align: 'center' });

  doc
    .fillColor(primary)
    .font('Helvetica-Bold')
    .fontSize(28)
    .text(studentName, 0, 190, { align: 'center' });

  doc
    .fillColor('#4B5563')
    .font('Helvetica')
    .fontSize(14)
    .text('concluiu com êxito o curso', 0, 232, { align: 'center' });

  doc
    .fillColor(dark)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(courseTitle, 60, 258, { align: 'center', width: width - 120 });

  const sealCenterX = width / 2;
  const sealCenterY = 365;
  doc.circle(sealCenterX, sealCenterY, 34).lineWidth(2).strokeColor(gold).stroke();
  doc.circle(sealCenterX, sealCenterY, 27).lineWidth(1).strokeColor(gold).stroke();
  doc
    .lineWidth(3)
    .strokeColor(gold)
    .lineCap('round')
    .lineJoin('round')
    .moveTo(sealCenterX - 12, sealCenterY)
    .lineTo(sealCenterX - 3, sealCenterY + 9)
    .lineTo(sealCenterX + 13, sealCenterY - 10)
    .stroke();

  doc
    .lineWidth(1)
    .strokeColor('#E5E7EB')
    .moveTo(width / 2 - 90, 430)
    .lineTo(width / 2 + 90, 430)
    .stroke();

  const issuedDate = new Date(issuedAt).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc
    .fillColor('#6B7280')
    .font('Helvetica')
    .fontSize(11)
    .text(`Emitido em ${issuedDate}`, 0, 448, { align: 'center' });

  doc
    .fillColor('#9CA3AF')
    .font('Helvetica')
    .fontSize(10)
    .text(`Código de verificação: ${code}`, 0, 468, { align: 'center' });

  doc
    .fillColor('#9CA3AF')
    .font('Helvetica')
    .fontSize(9)
    .text('Verifique este certificado em eduweb.com/verificar.html', 0, height - 60, { align: 'center' });

  doc.end();
}

module.exports = { generateCertificateCode, renderCertificatePdf };
