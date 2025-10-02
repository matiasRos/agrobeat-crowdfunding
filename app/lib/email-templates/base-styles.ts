// Estilos CSS base reutilizables para todos los templates de email

export const baseEmailStyles = `
/* -------------------------------------
FONTS - Geist Sans
------------------------------------- */

@font-face {
  font-family: 'Geist';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-sans/Geist-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-sans/Geist-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-sans/Geist-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-sans/Geist-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* -------------------------------------
GLOBAL RESETS
------------------------------------- */

body {
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.3;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

table {
  border-collapse: separate;
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  width: 100%;
}

table td {
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  vertical-align: top;
}

/* -------------------------------------
BODY & CONTAINER
------------------------------------- */

body {
  background-color: #f4f5f6;
  margin: 0;
  padding: 0;
}

.body {
  background-color: #f4f5f6;
  width: 100%;
}

.container {
  margin: 0 auto !important;
  max-width: 600px;
  padding: 0;
  padding-top: 24px;
  width: 600px;
}

.content {
  box-sizing: border-box;
  display: block;
  margin: 0 auto;
  max-width: 600px;
  padding: 0;
}

/* -------------------------------------
HEADER, FOOTER, MAIN
------------------------------------- */

.main {
  background: #ffffff;
  border: 1px solid #eaebed;
  border-radius: 16px;
  width: 100%;
}

.wrapper {
  box-sizing: border-box;
  padding: 24px;
}

.footer {
  clear: both;
  padding-top: 24px;
  text-align: center;
  width: 100%;
}

.footer td,
.footer p,
.footer span,
.footer a {
  color: #9a9ea6;
  font-size: 16px;
  text-align: center;
}

/* -------------------------------------
TYPOGRAPHY
------------------------------------- */

p {
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: normal;
  margin: 0;
  margin-bottom: 16px;
}

a {
  color: #000000;
  text-decoration: underline;
}

.detail-box {
  background-color: #f8f9fa;
  border-left: 4px solid #000000;
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
}

.bank-details {
  background-color: #f8f9fa;
  border: 1px solid #000000;
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
}

.detail-row {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  font-weight: 700;
  color: #333;
}

.warning-box {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px;
  color: #856404;
}

.whatsapp-link {
  color: #25D366;
  text-decoration: none;
}

/* -------------------------------------
BUTTONS
------------------------------------- */

.btn {
  box-sizing: border-box;
  min-width: 100% !important;
  width: 100%;
}

.btn > tbody > tr > td {
  padding-bottom: 16px;
}

.btn table {
  width: auto;
}

.btn table td {
  background-color: #ffffff;
  border-radius: 4px;
  text-align: center;
}

.btn a {
  background-color: #ffffff;
  border: solid 2px #000000;
  border-radius: 4px;
  box-sizing: border-box;
  color: #000000;
  cursor: pointer;
  display: inline-block;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 12px 24px;
  text-decoration: none;
  text-transform: capitalize;
}

.btn-primary table td {
  background-color: #000000;
}

.btn-primary a {
  background-color: #000000;
  border-color: #000000;
  color: #ffffff;
}

.btn-whatsapp table td {
  background-color: #25D366;
}

.btn-whatsapp a {
  background-color: #25D366;
  border-color: #25D366;
  color: #ffffff;
}

@media all {
  .btn-primary table td:hover {
    background-color: #171717e6 !important;
  }
  .btn-primary a:hover {
    background-color: #171717e6 !important;
    border-color: #171717e6 !important;
  }
  .btn-whatsapp table td:hover {
    background-color: #128C7E !important;
  }
  .btn-whatsapp a:hover {
    background-color: #128C7E !important;
    border-color: #128C7E !important;
  }
}

/* -------------------------------------
RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */

@media only screen and (max-width: 640px) {
  .main p,
  .main td,
  .main span {
    font-size: 16px !important;
  }
  .wrapper {
    padding: 8px !important;
  }
  .content {
    padding: 0 !important;
  }
  .container {
    padding: 0 !important;
    padding-top: 8px !important;
    width: 100% !important;
  }
  .main {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-right-width: 0 !important;
  }
  .btn table {
    max-width: 100% !important;
    width: 100% !important;
  }
  .btn a {
    font-size: 16px !important;
    max-width: 100% !important;
    width: 100% !important;
  }
  .detail-row {
    flex-direction: column;
  }
}
`;

export const emailFooter = `
<div class="footer">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td class="content-block">
        <span class="apple-link"><strong>Agrobeat | Inviertiendo en el futuro de la agricultura</strong></span>
        <br>Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
      </td>
    </tr>
    <tr>
      <td class="content-block powered-by">
        © 2025 Agrobeat. Todos los derechos reservados.
      </td>
    </tr>
  </table>
</div>
`;
