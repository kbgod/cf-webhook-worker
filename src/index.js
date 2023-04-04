export default {
	async fetch(request, env) {
		if (request.headers.get("x-cf-webhook-worker-api-key") != env.API_KEY) {
			return await this.respondJSON({"error": "invalid api key"}, 422)
		}
		return await this.proxy(request)
	},
	async respondJSON(body, status) {
		return new Response(JSON.stringify(body), {
			status: status,
			headers: new Headers({
				"x-is-webhook-worker": "true",
				"content-type": "application/json"
			})
		})
	},
	async proxy(request) {
		const url = request.headers.get("x-url")
		if (url == "" || url == null) {
			return await this.respondJSON({"error": "invalid url"}, 422)
		}
		const headers = new Headers()
		request.headers.forEach(((v, h) => {
			if (h === "cf-connecting-ip" ||
				h === "x-cf-webhook-worker-api-key" ||
				h === "x-forwarded-for" ||
				h === "x-real-ip" ||
				h === "x-url") {
				return
			}
			headers.append(h, v)
		}))
		let req = new Request(url, {
			method: request.method,
			headers: headers,
			body: request.body
		})

		return await fetch(req);
	}
}