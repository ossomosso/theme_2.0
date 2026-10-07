(() => {
  const GROUP_ORDER = ['Parte superior', 'Parte inferior', 'Base', 'Bombilla'];

  document.querySelectorAll('[data-ossomosso-customizer]').forEach((root) => {
    const data = root.querySelector('[data-customizer-options]');
    const list = root.querySelector('[data-option-list]');
    const layers = root.querySelector('.ossomosso-customizer__layers');
    const form = root.querySelector('[data-customizer-form]');
    if (!data || !list || !layers || !form) return;

    let options;
    try {
      options = JSON.parse(data.textContent);
    } catch (_) {
      return;
    }

    const grouped = GROUP_ORDER.map((group) => [group, options.filter((option) => option.group === group)])
      .filter(([, values]) => values.length);
    const selected = Object.fromEntries(grouped.map(([group]) => [group, 0]));

    const update = () => {
      layers.replaceChildren();
      list.replaceChildren();
      form.querySelectorAll('[data-customizer-property]').forEach((input) => input.remove());

      grouped.forEach(([group, values]) => {
        const index = selected[group];
        const value = values[index];
        if (value.image) {
          const image = document.createElement('img');
          image.src = value.image;
          image.alt = '';
          image.decoding = 'async';
          layers.append(image);
        }

        const property = document.createElement('input');
        property.type = 'hidden';
        property.name = `properties[${group}]`;
        property.value = value.colour || value.label;
        property.dataset.customizerProperty = '';
        form.append(property);

        const option = document.createElement('div');
        option.className = 'ossomosso-customizer__option';
        option.innerHTML = `
          <div class="ossomosso-customizer__option-heading"><strong>${group}</strong><span></span></div>
          <div class="ossomosso-customizer__picker">
            <button type="button" class="ossomosso-customizer__arrow" aria-label="Opción anterior para ${group}">‹</button>
            <div class="ossomosso-customizer__current"><i class="ossomosso-customizer__swatch"></i><span></span></div>
            <button type="button" class="ossomosso-customizer__arrow" aria-label="Opción siguiente para ${group}">›</button>
          </div>`;
        option.querySelector('.ossomosso-customizer__option-heading span').textContent = value.label;
        option.querySelector('.ossomosso-customizer__current span').textContent = value.colour || value.label;
        option.querySelector('.ossomosso-customizer__swatch').style.setProperty('--swatch', value.swatch || 'transparent');
        const buttons = option.querySelectorAll('button');
        buttons[0].addEventListener('click', () => {
          selected[group] = (selected[group] - 1 + values.length) % values.length;
          update();
        });
        buttons[1].addEventListener('click', () => {
          selected[group] = (selected[group] + 1) % values.length;
          update();
        });
        list.append(option);
      });
    };

    update();
  });
})();
