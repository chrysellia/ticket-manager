const nameCheck = /^[-_a-zA-Z0-9]{4,22}$/;
const tokenCheck = /^[-_/+a-zA-Z0-9]{24,}$/;

// Generate and double-submit a CSRF token in a form field and a cookie, as defined by Symfony's SameOriginCsrfTokenManager
document.addEventListener('submit', function (event: Event) {
    const form = event.target as HTMLFormElement;
    generateCsrfToken(form);
}, true);

// When @hotwired/turbo handles form submissions, send the CSRF token in a header in addition to a cookie
// The `framework.csrf_protection.check_header` config option needs to be enabled for the header to be checked
document.addEventListener('turbo:submit-start', function (event: CustomEvent) {
    const h = generateCsrfHeaders(event.detail.formSubmission.formElement);
    Object.keys(h).forEach((k: string) => {
        event.detail.formSubmission.fetchRequest.headers[k] = h[k as keyof typeof h];
    });
});

// When @hotwired/turbo handles form submissions, remove the CSRF cookie once a form has been submitted
document.addEventListener('turbo:submit-end', function (event: CustomEvent) {
    removeCsrfToken(event.detail.formSubmission.formElement);
});

function generateCsrfToken(formElement: HTMLFormElement): void {
    if (!(formElement instanceof HTMLFormElement)) {
        return;
    }

    const csrfTokenField = formElement.querySelector('input[type="hidden"][name^="_token"][name$="[token]"]') as HTMLInputElement;

    if (!csrfTokenField) {
        return;
    }

    const csrfToken = csrfTokenField.value;
    if (!tokenCheck.test(csrfToken)) {
        return;
    }

    const tokenMatch = csrfTokenField.name.match(/^_csrf_(token|value)$/);
    const csrfMatch = csrfTokenField.name.match(/^_csrf_(.*)$/);
    const csrfTokenName = tokenMatch ? '_token' : csrfMatch ? csrfMatch[1] : '';
    if (!nameCheck.test(csrfTokenName)) {
        return;
    }

    document.cookie = `_csrf_${csrfTokenName}=${csrfToken}; path=/; samesite=lax`;
}

function generateCsrfHeaders(formElement: HTMLFormElement): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (!(formElement instanceof HTMLFormElement)) {
        return headers;
    }

    const csrfTokenField = formElement.querySelector('input[type="hidden"][name^="_token"][name$="[token]"]') as HTMLInputElement;
    if (!csrfTokenField) {
        return headers;
    }

    const csrfToken = csrfTokenField.value;
    if (!tokenCheck.test(csrfToken)) {
        return headers;
    }

    const tokenMatch = csrfTokenField.name.match(/^_csrf_(token|value)$/);
    const csrfMatch = csrfTokenField.name.match(/^_csrf_(.*)$/);
    const csrfTokenName = tokenMatch ? '_token' : csrfMatch ? csrfMatch[1] : '';
    if (!nameCheck.test(csrfTokenName)) {
        return headers;
    }

    headers['X-CSRF-Token'] = csrfToken;
    return headers;
}

function removeCsrfToken(formElement: HTMLFormElement): void {
    if (!(formElement instanceof HTMLFormElement)) {
        return;
    }

    const csrfTokenField = formElement.querySelector('input[type="hidden"][name^="_token"][name$="[token]"]') as HTMLInputElement;
    if (!csrfTokenField) {
        return;
    }

    const tokenMatch = csrfTokenField.name.match(/^_csrf_(token|value)$/);
    const csrfMatch = csrfTokenField.name.match(/^_csrf_(.*)$/);
    const csrfTokenName = tokenMatch ? '_token' : csrfMatch ? csrfMatch[1] : '';
    if (!nameCheck.test(csrfTokenName)) {
        return;
    }

    document.cookie = `_csrf_${csrfTokenName}=; path=/; samesite=lax; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

/* stimulusFetch: 'lazy' */
export default 'csrf-protection-controller';
