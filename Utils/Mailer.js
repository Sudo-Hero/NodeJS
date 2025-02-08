const mailer = require("nodemailer")

const sendEmail = async (opt) => {
    const transporter = mailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    let info = await transporter.sendMail({
        from: "Cineflix Support<support@cineflix.com>",
        to: opt.email,
        subject: opt.subject,
        text: opt.message
    })
    return info;
}

module.exports = sendEmail;