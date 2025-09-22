// public/js/admin.js

document.addEventListener('DOMContentLoaded', function() {

    // --- Ürün Silme Onay Kodu ---
    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Bu satırı siliyoruz çünkü inline onclick kullanıyoruz
            // event.preventDefault(); 
        });
    });

    // --- Mesaj Okuma Kodu ---
    const readMessageButtons = document.querySelectorAll('.btn-read-message');

    readMessageButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Linkin sayfanın başına atmasını engelle
            event.preventDefault();

            // Butonun data-* özniteliklerinden verileri al
            const name = this.dataset.name;
            const email = this.dataset.email;
            const subject = this.dataset.subject;
            const message = this.dataset.message;

            // SweetAlert2 ile popup'ı göster
            Swal.fire({
                title: `<strong>Konu: ${subject}</strong>`,
                icon: 'info',
                html: `
                    <div style="text-align: left; padding: 0 1em;">
                        <p><strong>Gönderen:</strong> ${name} (${email})</p>
                        <hr>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                `,
                showCloseButton: true,
                focusConfirm: false,
                confirmButtonText: 'Kapat'
            });
        });
    });

});