module.exports=class Templates {
  static otpEmailTemplate(name, otp) {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: 800px 452px;
        background-position: top center;
        font-size: 14px;
        color: #434343;
      "
    >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td>
                <img
                  alt=""
                  src="https://placehold.co/2834x423/png/?text=eBookingCinemaSystem"
                  height="30px"
                />
              </td>
              <td style="text-align: right;">
                <span
                  style="font-size: 16px; line-height: 30px; color: #ffffff;"
                  >
                  ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo', hour12: true })}
                  </span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <h1
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Your OTP
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              Hey ${name},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Thank you for choosing Archisketch Company. Use the following OTP
              to complete the procedure to change your email address. OTP is
              valid for
              <span style="font-weight: 600; color: #1f1f1f;">5 minutes</span>.
              Do not share this code with others, including Archisketch
              employees.
            </p>
            <p
              style="
                margin: 0;
                margin-top: 60px;
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #ba3d4f;
              "
            >
              ${otp}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:archisketch@gmail.com"
            style="color: #499fb6; text-decoration: none;"
            >archisketch@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none;"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          Archisketch Company
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343;">
          Address 540, City, State.
        </p>
        <div style="margin: 0; margin-top: 16px;">
          <a href="" target="_blank" style="display: inline-block;">
            <img
              width="36px"
              alt="Facebook"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Instagram"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
          /></a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Twitter"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Youtube"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
          /></a>
        </div>
        <p style="margin: 0; margin-top: 16px; color: #434343;">
          Copyright © 2022 Company. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>
`;
  }
  static resetPasswordTemplate(name, link) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:white; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); overflow:hidden;">
  
  <tr>
    <td style="background-color:#e84c3d; padding:20px; text-align:center;">
      <h1 style="margin:0; color:white; font-size:24px;">Reset Your Password</h1>
    </td>
  </tr>

  <tr>
    <td style="padding:30px; text-align:center;">
      <p style="font-size:16px; color:#333;">Hi ${name},</p>
      <p style="font-size:14px; color:#666; margin:20px 0;">
        We received a request to reset your password. Click the button below to set a new password.
      </p>
      
      <a href="${link}" style="display:inline-block; margin:30px 0; padding:12px 25px; background-color:#e84c3d; color:white; text-decoration:none; border-radius:5px; font-size:16px;">
        Reset Password
      </a>

      <p style="font-size:14px; color:#666; margin:20px 0;">
        If you didn’t request a password reset, you can safely ignore this email.
      </p>

      <p style="font-size:12px; color:#999; margin-top:30px;">This link will expire in 10 mins.</p>
    </td>
  </tr>

  <tr>
    <td style="background-color:#f9f9f9; padding:20px; text-align:center; font-size:12px; color:#999;">
      <p>Cinema eBooking System © 2025. All rights reserved.</p>
    </td>
  </tr>

</table>

</body>
</html>
`
  }
  static styledTickets(tickets, authName) {
    return tickets.map(ticket => {
      const {
        movie,
        seatLabel,
        time
      } = ticket
      return `
  <tr>
        <td style="padding-bottom: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecedef; border-radius: 10px; overflow: hidden;">
            <tr>
              <!-- Left Side -->
              <td style="width: 70%; background-color: #e84c3d; color: #fff; padding: 20px; vertical-align: top;">
                <h2 style="margin: 0;">Ismail's <span style="font-weight: normal;">Cinema</span></h2>
                <div style="margin-top: 25px;">
                  <p style="margin: 0; font-size: 14px; text-transform: uppercase;">Movie</p>
                  <h3 style="margin: 2px 0;">${movie}</h3>

                  <p style="margin: 15px 0 0; font-size: 14px; text-transform: uppercase;">Name</p>
                  <h3 style="margin: 2px 0;">${authName}</h3>

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right: 10px;">
                        <p style="margin: 15px 0 0; font-size: 14px; text-transform: uppercase;">Seat</p>
                        <h3 style="margin: 2px 0;">${seatLabel}</h3>
                      </td>
                      <td>
                        <p style="margin: 15px 0 0; font-size: 14px; text-transform: uppercase;">Time</p>
                        <h3 style="margin: 2px 0;">${time}</h3>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>

              <!-- Right Side with Notches -->
              <td style="width: 30%; padding: 20px; background-color: #ffffff; border-left: 2px dashed #ccc; text-align: center; position: relative;">
                
                <!-- Top Notch -->
                <div style="
                  position: absolute;
                  top: -10px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 20px;
                  height: 20px;
                  background-color: #f4f4f4;
                  border-radius: 50%;
                  z-index: 1;
                "></div>

                <!-- Bottom Notch -->
                <div style="
                  position: absolute;
                  bottom: -10px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 20px;
                  height: 20px;
                  background-color: #f4f4f4;
                  border-radius: 50%;
                  z-index: 1;
                "></div>

                <div style="margin-bottom: 20px;">
                  <svg enable-background="new 0 0 128 128" height="80px" id="Layer_1" version="1.1" viewBox="0 0 128 128" width="128px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <path d="M89.843,64.815c-1.104,0-2-0.896-2-2V33.57c0-5.626-4.577-10.203-10.202-10.203H50.393c-5.624,0-10.2,4.577-10.2,10.203  v29.245c0,1.104-0.896,2-2,2s-2-0.896-2-2V33.57c0-7.832,6.37-14.203,14.2-14.203h27.248c7.831,0,14.202,6.371,14.202,14.203v29.245  C91.843,63.919,90.947,64.815,89.843,64.815z"/>
                    <path d="M91.843,101.148h-55.65V73.016h55.65V101.148z M40.192,97.148h47.65V77.016h-47.65V97.148z"/>
                    <path d="M40.192,101.148H25.088V68.137c-6.279-0.967-11.104-6.406-11.104-12.951c0-7.226,5.878-13.104,13.104-13.104  s13.104,5.879,13.104,13.104V101.148z M29.088,97.148h7.104V55.186c0-5.021-4.084-9.104-9.104-9.104  c-5.02,0-9.104,4.084-9.104,9.104c0,5.02,4.084,9.103,9.104,9.103h2V97.148z"/>
                    <path d="M102.944,101.148H87.843V55.186c0-7.226,5.877-13.104,13.102-13.104s13.103,5.879,13.103,13.104  c0,6.545-4.824,11.984-11.103,12.951V101.148z M91.843,97.148h7.102v-32.86h2c5.02,0,9.103-4.083,9.103-9.103  c0-5.021-4.083-9.104-9.103-9.104c-5.019,0-9.102,4.084-9.102,9.104V97.148z"/>
                    <path d="M38.192,107.238c-1.104,0-2-0.896-2-2v-4.404c0-1.104,0.896-2,2-2s2,0.896,2,2v4.404  C40.192,106.342,39.297,107.238,38.192,107.238z"/>
                    <path d="M89.843,107.238c-1.104,0-2-0.896-2-2v-4.404c0-1.104,0.896-2,2-2s2,0.896,2,2v4.404  C91.843,106.342,90.947,107.238,89.843,107.238z"/>
                  </svg>
                </div>

                <h2 style="margin: 0; font-size: 24px; color: #e84c3d;">${seatLabel}</h2>
                <p style="font-size: 12px; color: #999;">Seat</p>

                <div style="margin-top: 25px;">
                  <div style="
                    height: 40px;
                    width: 90%;
                    margin: 0 auto;
                    background-image: repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 3px);
                  "></div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    }).join('');
  }
  static ticketsEmailTemplate(tickets, name) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>eTickets</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
      <tr>
        <td align="center" style="padding-bottom: 30px;">
          <h1 style="color: #e84c3d;">🎬 Ismail's Cinema - Your Tickets</h1>
        </td>
      </tr>

      <!-- Loop starts -->
      ${this.styledTickets(tickets,name)}
      <!-- Loop ends -->

      <tr>
        <td align="center" style="font-size: 12px; color: #999;">
          <p>Cinema eBooking System © 2025. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }
  static orderEmail(customerName, products) {
    return `<section class="vh-100" style="background-color: #35558a;">
<div class="container py-5 h-100">
  <div class="row d-flex justify-content-center align-items-center h-100 text-center">
    <div class="col">
      <!-- Button trigger modal -->
      <button  type="button" data-mdb-button-init data-mdb-ripple-init class="btn btn-light btn-lg" data-mdb-modal-init
        data-mdb-target="#exampleModal">
        <i class="fas fa-info me-2"></i> Get information
      </button>

      <!-- Modal -->
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header border-bottom-0">
              <button  type="button" data-mdb-button-init data-mdb-ripple-init class="btn-close" data-mdb-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-start p-4">
              <h5 class="modal-title text-uppercase mb-5" id="exampleModalLabel">${customerName}</h5>
              <h4 class="mb-5">Thanks for your order</h4>
              <p class="mb-0">Payment summary</p>
              <hr class="mt-2 mb-4"
                style="height: 0; background-color: transparent; opacity: .75; border-top: 2px dashed #9e9e9e;">

              <div class="d-flex justify-content-between">
                
          ${products.map(product=>`
              <div class="d-flex justify-content-between">
                <p class="fw-bold mb-0">${product.title}(Qty:${product.quantity})</p>
                <p class="text-muted mb-0">$${product.price}</p>
              </div>
              `)}
            </div>
            <div class="modal-footer d-flex justify-content-center border-top-0 py-4">
              <button  type="button" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-lg mb-1" style="background-color: #35558a;">
                Track your order
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
</section>`;
  }
}
;