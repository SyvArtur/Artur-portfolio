	emailjs.init("X9lVuGZKFkdPR8eNm");

	function openMailModal() {
		document
			.getElementById("mailModal")
			.classList.add("active");
	}

	function closeMailModal() {
		document
			.getElementById("mailModal")
			.classList.remove("active");
	}

	document.querySelectorAll("[data-copy-email]").forEach((button) => {
		button.addEventListener("click", async (event) => {
			event.stopPropagation();

			const email = button
				.closest(".email-trigger")
				.querySelector(".email-trigger__address")
				.textContent
				.trim();
			const status = button
				.closest(".email-trigger")
				.querySelector("[data-copy-status]");

			try {
				await navigator.clipboard.writeText(email);
				status.textContent = button.dataset.copySuccess;
			} catch (error) {
				console.error("Failed to copy email address:", error);
				status.textContent = button.dataset.copyError;
			}
		});
	});

	document.querySelectorAll(".email-trigger__address").forEach((link) => {
		link.addEventListener("click", (event) => {
			event.stopPropagation();
		});
	});

	window.addEventListener("click", (e) => {
		if (e.target.id === "mailModal") {
			closeMailModal();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeMailModal();
		}
	});

	function sendMail() {
		const button = document.querySelector(".send-btn");

		const email =
			document.getElementById("replyEmail").value;

		const emailPattern =
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailPattern.test(email)) {
			alert("Пожалуйста, введите корректный email");
			return;
		}

		if (!document.getElementById("message").value.trim()) {
			alert("Введите сообщение");
			return;
		}

		const params = {
			reply_email: email,
			subject:
				document.getElementById("subject").value,
			message:
				document.getElementById("message").value
		};

		button.disabled = true;

		emailjs.send(
			"service_imwxjfd",
			"template_hbqh11i",
			params
		)

		.then(() => {
			alert("Сообщение отправлено!");
			closeMailModal();
		})

		.catch((error) => {
			console.error(error);
			alert("Не удалось отправить сообщение");
		})

		.finally(() => {
			button.disabled = false;
		});
	}
	
const currentPath = window.location.pathname;
const currentLang = currentPath.includes("/ru/") ? "ru" : "en";
const langButtons = document.querySelectorAll(".lang-btn");
langButtons.forEach(btn => {
  if (btn.dataset.lang === currentLang) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
});
langButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const targetLang = btn.dataset.lang;
    if (targetLang === currentLang) {
      e.preventDefault();
      return;
    }
  });
});