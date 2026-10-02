document.addEventListener('DOMContentLoaded', () => {
    const portrait = document.querySelector('.portrait-flip');
    if (!portrait) return;

    const front = portrait.querySelector('.portrait-flip-face--front');
    const back = portrait.querySelector('.portrait-flip-face--back');
    let flipBackTimeout;

    const showFireworks = (event) => {
        const fireworks = document.createElement('span');
        fireworks.className = 'portrait-fireworks';
        fireworks.setAttribute('aria-hidden', 'true');

        const bounds = portrait.getBoundingClientRect();
        const clickX = event.detail > 0 ? event.clientX - bounds.left : bounds.width / 2;
        const clickY = event.detail > 0 ? event.clientY - bounds.top : bounds.height / 2;
        const burstPositions = Array.from({ length: 5 }, () => [
            `${10 + Math.random() * 80}%`,
            `${10 + Math.random() * 80}%`
        ]);
        burstPositions.push([`${clickX}px`, `${clickY}px`]);

        for (const [left, top] of burstPositions) {
            const burst = document.createElement('span');
            burst.className = 'portrait-firework-burst';
            burst.style.left = left;
            burst.style.top = top;

            for (let index = 0; index < 24; index += 1) {
                const spark = document.createElement('span');
                spark.className = 'portrait-firework-spark';
                spark.classList.add(index % 2 === 0 ? 'is-blue' : 'is-red');
                spark.style.setProperty('--angle', `${index * 15}deg`);
                spark.style.setProperty('--distance', `${42 + (index % 4) * 9}px`);
                burst.append(spark);
            }

            fireworks.append(burst);
        }

        portrait.append(fireworks);
        setTimeout(() => fireworks.remove(), 1000);
    };

    portrait.addEventListener('click', (event) => {
        const isFlipped = portrait.classList.toggle('is-flipped');
        portrait.setAttribute('aria-pressed', String(isFlipped));
        portrait.setAttribute('aria-label', isFlipped ? 'Show serious photo' : 'Show funny photo');
        front?.setAttribute('aria-hidden', String(isFlipped));
        back?.setAttribute('aria-hidden', String(!isFlipped));

        clearTimeout(flipBackTimeout);
        if (isFlipped) {
            showFireworks(event);
            flipBackTimeout = setTimeout(() => {
                portrait.classList.remove('is-flipped');
                portrait.setAttribute('aria-pressed', 'false');
                portrait.setAttribute('aria-label', 'Show funny photo');
                front?.setAttribute('aria-hidden', 'false');
                back?.setAttribute('aria-hidden', 'true');
                flipBackTimeout = undefined;
            }, 3000);
        }
    });
});
