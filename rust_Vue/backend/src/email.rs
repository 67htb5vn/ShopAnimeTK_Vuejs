use lettre::{
    message::Mailbox,
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};

fn env_value(key: &str) -> Option<String> {
    std::env::var(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

pub async fn send_email(to: &str, subject: &str, body: &str) -> Result<bool, String> {
    let to = to.trim();
    if to.is_empty() {
        return Ok(false);
    }

    let host = match env_value("SMTP_HOST") {
        Some(value) => value,
        None => {
            println!("SMTP_HOST is not configured; skipped email to {to}");
            return Ok(false);
        }
    };
    let username = env_value("SMTP_USERNAME")
        .ok_or_else(|| "SMTP_USERNAME is not configured".to_string())?;
    let password = env_value("SMTP_PASSWORD")
        .ok_or_else(|| "SMTP_PASSWORD is not configured".to_string())?;
    let from = env_value("SMTP_FROM").unwrap_or_else(|| username.clone());
    let port = env_value("SMTP_PORT")
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(587);

    let from: Mailbox = from
        .parse()
        .map_err(|err| format!("SMTP_FROM is invalid: {err}"))?;
    let to: Mailbox = to
        .parse()
        .map_err(|err| format!("Recipient email is invalid: {err}"))?;

    let message = Message::builder()
        .from(from)
        .to(to)
        .subject(subject)
        .body(body.to_string())
        .map_err(|err| err.to_string())?;

    let builder = if port == 465 {
        AsyncSmtpTransport::<Tokio1Executor>::relay(&host)
    } else {
        AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&host)
    }
    .map_err(|err| err.to_string())?;

    let mailer = builder
        .port(port)
        .credentials(Credentials::new(username, password))
        .build();

    mailer
        .send(message)
        .await
        .map(|_| true)
        .map_err(|err| err.to_string())
}

pub async fn send_best_effort(to: Option<&str>, subject: &str, body: &str) -> bool {
    let Some(to) = to.map(str::trim).filter(|value| !value.is_empty()) else {
        return false;
    };

    match send_email(to, subject, body).await {
        Ok(sent) => sent,
        Err(err) => {
            println!("Could not send email to {to}: {err}");
            false
        }
    }
}

pub fn is_order_notice_status(status_id: &str, status_name: Option<&str>) -> bool {
    let keywords = env_value("ORDER_EMAIL_STATUS_KEYWORDS")
        .unwrap_or_else(|| "xác nhận,xac nhan,hủy,huỷ,huy".to_string());
    let status = format!(
        "{} {}",
        status_id.to_lowercase(),
        status_name.unwrap_or_default().to_lowercase()
    );

    keywords
        .split(',')
        .map(str::trim)
        .filter(|keyword| !keyword.is_empty())
        .any(|keyword| status.contains(&keyword.to_lowercase()))
}
