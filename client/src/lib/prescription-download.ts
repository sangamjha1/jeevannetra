// Generate prescription PDF using jspdf and html2canvas
export async function downloadPrescriptionPDF(prescription: any, patientName: string) {
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Create a hidden div to render prescription content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';

    container.innerHTML = `
      <div style="border: 2px solid #333; padding: 20px; text-align: center;">
        <h2 style="margin: 0 0 5px 0; color: #333;">MEDICAL PRESCRIPTION</h2>
        <p style="margin: 0; color: #666; font-size: 11px;">Jeevan Netra - Healthcare Management System</p>
        <hr style="margin: 15px 0; border: 1px solid #ddd;">
        
        <div style="text-align: left;">
          <p><strong>Patient Name:</strong> ${patientName}</p>
          <p><strong>Prescription ID:</strong> ${prescription.id}</p>
          <p><strong>Doctor:</strong> ${prescription.doctor?.user?.firstName} ${prescription.doctor?.user?.lastName}</p>
          <p><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</p>
          <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
          
          <h3 style="margin-top: 20px; color: #333;">Medicines Prescribed:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f0f0f0; border: 1px solid #ddd;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Medicine</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Dosage</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Frequency</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medicines?.map((med: any) => `
                <tr style="border: 1px solid #ddd;">
                  <td style="padding: 8px; border: 1px solid #ddd;">${med.name}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${med.dosage}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${med.frequency}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${med.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h3 style="margin-top: 20px; color: #333;">Instructions:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${prescription.instructions}</p>
          
          <hr style="margin: 20px 0; border: 1px solid #ddd;">
          <p style="font-size: 10px; color: #999; text-align: center; margin-top: 20px;">
            Generated on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`prescription-${prescription.id}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to download prescription');
  }
}

// Generate text-based prescription download (simple fallback)
export function downloadPrescriptionText(prescription: any, patientName: string) {
  const content = `
MEDICAL PRESCRIPTION
Jeevan Netra - Healthcare Management System
=====================================

Patient Name: ${patientName}
Prescription ID: ${prescription.id}
Doctor: ${prescription.doctor?.user?.firstName} ${prescription.doctor?.user?.lastName}
Date: ${new Date(prescription.createdAt).toLocaleDateString()}
Diagnosis: ${prescription.diagnosis}

MEDICINES PRESCRIBED:
${prescription.medicines?.map((med: any) => `
- ${med.name}
  Dosage: ${med.dosage}
  Frequency: ${med.frequency}
  Duration: ${med.duration}
`).join('\n')}

INSTRUCTIONS:
${prescription.instructions}

Generated on: ${new Date().toLocaleString()}
  `;

  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `prescription-${prescription.id}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
