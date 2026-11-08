import { getLabel } from "./runtime.js";

export function clearEnquiryFeedback(popup) {
    const form = popup?.querySelector("form");
    if (!form || form.getAttribute("aria-busy") === "true") return;
    const status = form.querySelector(".rec-form-status");
    if (status) { status.hidden = true; status.replaceChildren(); }
}

export function bindEnquiryForm(form, getContext = () => ({})) {
    if (!form || form.dataset.mailReady === "true") return;
    form.dataset.mailReady = "true";
    const status = form.querySelector(".rec-form-status");
    const button = form.querySelector('[type="submit"]');
    let pending = false;
    let requestId = "";
    let previousPayload = "";
    const report = (message, state) => {
        status.hidden = false;
        status.dataset.state = state;
        status.textContent = message;
    };
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (pending || !form.reportValidity()) return;
        const data = new FormData(form);
        if (data.get("form_type") === "project" && !data.getAll("request_type[]").length) {
            report(getLabel("form_choose_type", "Выберите хотя бы один тип заявки."), "error");
            status.focus();
            return;
        }
        Object.entries(getContext()).forEach(([key, value]) => data.set(key, value ?? ""));
        const payload = JSON.stringify([...data.entries()]);
        if (!requestId || payload !== previousPayload) {
            requestId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
            previousPayload = payload;
        }
        pending = true;
        button.disabled = true;
        form.setAttribute("aria-busy", "true");
        report(getLabel("form_sending", "Отправляем заявку…"), "pending");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        try {
            const endpoint = window.recTheme?.forms?.endpoint;
            if (!endpoint) throw new Error(getLabel("form_error", "Не удалось отправить заявку. Попробуйте позже."));
            // Fetch a current nonce even when the page itself came from a cache.
            const tokenUrl = new URL(endpoint, location.origin);
            tokenUrl.searchParams.set("action", "rec_studio_form_token");
            const tokenResponse = await fetch(tokenUrl, { credentials: "same-origin", cache: "no-store", signal: controller.signal });
            const token = await tokenResponse.json();
            if (!tokenResponse.ok || !token.success || !token.data?.nonce) throw new Error();
            data.set("nonce", token.data.nonce);
            data.set("request_id", requestId);
            data.set("action", "rec_studio_submit_form");
            const response = await fetch(endpoint, { method: "POST", body: data, credentials: "same-origin", signal: controller.signal });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.data?.message || "");
            report(result.data.message || getLabel("form_success", "Спасибо! Ваша заявка отправлена."), "success");
            if (result.data.download && /^https?:\/\//i.test(result.data.download)) {
                const link = document.createElement("a");
                link.href = result.data.download;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = getLabel("price_submit", "Скачать прайс");
                status.append(document.createElement("br"), link);
            }
            const context = [...form.querySelectorAll('input[type="hidden"], input[readonly]')].map(input => [input, input.value]);
            form.reset();
            context.forEach(([input, value]) => { input.value = value; });
            requestId = "";
            previousPayload = "";
            status.focus();
        } catch (error) {
            // Keep both user input and request ID: retrying a lost response must not duplicate mail.
            report(error.name === "AbortError"
                ? getLabel("form_timeout", "Сервер отвечает дольше обычного. Повторите отправку: повторная попытка с теми же данными не создаст вторую заявку в течение часа.")
                : (error.message && error.name === "Error" ? error.message : getLabel("form_error", "Не удалось отправить заявку. Проверьте соединение и попробуйте позже.")), "error");
            status.focus();
        } finally {
            clearTimeout(timeout);
            pending = false;
            button.disabled = false;
            form.removeAttribute("aria-busy");
        }
    });
}
