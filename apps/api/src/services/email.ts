import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendBookingConfirmation(to: string, data: { lawyerName: string, date: string, meetUrl: string }) {
  await resend.emails.send({
    from:    'LegalHub <noreply@legalhub.in>',
    to,
    subject: `Booking Confirmed with ${data.lawyerName}`,
    html:    `<p>Your consultation is confirmed for <b>${data.date}</b>.
              <a href="${data.meetUrl}">Join here</a></p>`
  })
}

export async function sendLawyerVerified(to: string, name: string) {
  await resend.emails.send({
    from:    'LegalHub <noreply@legalhub.in>',
    to,
    subject: 'Your LegalHub profile is verified ✅',
    html:    `<p>Congratulations ${name}! Your account is verified. You can now accept bookings.</p>`
  })
}

export async function sendLawyerRejected(to: string, name: string, reason: string) {
  await resend.emails.send({
    from:    'LegalHub <support@legalhub.in>',
    to,
    subject: 'Action required — LegalHub verification',
    html:    `<p>Hi ${name}, your verification needs attention: <b>${reason}</b></p>`
  })
}
