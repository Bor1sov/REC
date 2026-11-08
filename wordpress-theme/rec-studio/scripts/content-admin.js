/* WordPress media library controls for the theme's content screens. */
(function ($) {
    function preview(input, url) {
        const field = input.closest('.rec-admin-field');
        field.find('.rec-media-preview').remove();
        if (/\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(url)) {
            $('<img>', { class: 'rec-media-preview', src: url, alt: '' }).appendTo(field);
        }
    }
    $(document).on('click', '.rec-select-media', function () {
        const input = $(document.getElementById(this.dataset.target));
        const frame = wp.media({ title: 'Выберите изображение или файл', button: { text: 'Использовать' }, multiple: false });
        frame.on('select', function () {
            const item = frame.state().get('selection').first().toJSON();
            input.val(item.url).trigger('change');
            preview(input, item.url);
        });
        frame.open();
    }).on('click', '.rec-clear-media', function () {
        const input = $(document.getElementById(this.dataset.target));
        input.val('').trigger('change');
        preview(input, '');
    });
})(jQuery);
