export async function verifyHCaptcha(token: string): Promise<boolean> {
	const secret = process.env.HCAPTCHA_SECRET_KEY!;
	const res = await fetch("https://hcaptcha.com/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: `response=${token}&secret=${secret}`,
	});

	const data = await res.json();
	return data.success === true;
}
