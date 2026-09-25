// =====================================================
// Grab the elements we need to control
// =====================================================
const playerHeader = document.getElementById('player');
const timelineFill = document.getElementById('timelineFill');
const timelineHandle = document.getElementById('timelineHandle');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sections = Array.from(document.querySelectorAll('.section'));
const footer = document.getElementById('footer');
let returningToTop = false;
let atFooter = false;
// How far the user needs to scroll (in pixels) before the header shrinks.
// A small threshold like this avoids the header flickering in and out right at 0.
const SHRINK_THRESHOLD = 40;

// `isPaused` controls whether the progress bar keeps listening to scroll.
// The page itself never stops scrolling — only the bar's updates do.
// let isPaused = false;

// =====================================================
// Core math: convert scroll position -> percentage (0–100)
// =====================================================
function getScrollPercent() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  // Total distance that can be scrolled = full document height minus one viewport.
  // This is recalculated every time we call the function, so it automatically
  // adapts if the page height changes (window resize, content loading, etc.)
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) return 0; // page is shorter than the viewport, nothing to scroll

  const percent = (scrollTop / docHeight) * 100;

  // Clamp between 0 and 100 so rounding/edge cases never overflow the bar
  return Math.min(100, Math.max(0, percent));
}

// =====================================================
// Update the visual progress bar to match a given percentage
// =====================================================
function updateProgressBar(percent) {
  timelineFill.style.width = percent + '%';
  timelineHandle.style.left = percent + '%';
}

// =====================================================
// Shrink/expand the header depending on scroll position
// =====================================================
// This is independent of the pause/play state on purpose: pausing only
// freezes the progress *bar*, it shouldn't stop the header from shrinking.
function updateHeaderSize() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop > SHRINK_THRESHOLD) {
    playerHeader.classList.add('player--scrolled');
  } else {
    playerHeader.classList.remove('player--scrolled');
  }
}

// =====================================================
// Scroll event handler
// =====================================================
function handleScroll() {
  updateHeaderSize();

  const percent = getScrollPercent();
  updateProgressBar(percent);

  if (returningToTop) return;

  if (percent <= 0) {
    playPauseBtn.textContent = '▶';
    playPauseBtn.setAttribute('aria-label', 'Play');
  } else {
    playPauseBtn.textContent = '⏸';
    playPauseBtn.setAttribute('aria-label', 'Pause');
  }
}
window.addEventListener('scroll', handleScroll, { passive: true });

// Recalculate on resize too, since docHeight can change when the layout reflows
// (getScrollPercent() already reads live values, so we just need to re-run the update)
window.addEventListener('resize', () => {
  updateHeaderSize();
  updateProgressBar(getScrollPercent());
});

// Run once on load so the bar and header are correct even if the page opens
// mid-scroll (e.g. after a reload)
updateHeaderSize();
updateProgressBar(0);

// =====================================================
// Pause / Play button
// =====================================================

playPauseBtn.addEventListener('click', () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  // If we are not at the top -> go to first section
  if (scrollTop > 0) {
    returningToTop = true;

    sections[0].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    playPauseBtn.textContent = '▶';
    playPauseBtn.setAttribute('aria-label', 'Play');

    setTimeout(() => {
      returningToTop = false;
    }, 600);

    return;
  }

  // Already at the very top -> go to first section
  returningToTop = true;

  sections[0].scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  playPauseBtn.textContent = '⏸';
  playPauseBtn.setAttribute('aria-label', 'Pause');

  setTimeout(() => {
    returningToTop = false;
  }, 600);
});


// =====================================================
// Next / Previous section navigation
// =====================================================

function getActiveSectionIndex() {
  const headerOffset = playerHeader.offsetHeight;
  let activeIndex = 0;

  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= headerOffset + 5) {
      activeIndex = i;
    }
  });

  return activeIndex;
}

function scrollToSection(index) {
  atFooter = false;

  if (index >= sections.length) {
    atFooter = true;

    footer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    return;
  }

  const clamped = Math.max(0, index);

  sections[clamped].scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


// =====================================================
// NEXT
// =====================================================

nextBtn.addEventListener('click', () => {

  // Footer -> First Section
  if (atFooter) {
    atFooter = false;

    sections[0].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  const current = getActiveSectionIndex();

  // Last Section -> Footer
  if (current === sections.length - 1) {
    atFooter = true;

    footer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // Normal next
  scrollToSection(current + 1);
});

// =====================================================
// PREVIOUS
// =====================================================

prevBtn.addEventListener('click', () => {

  // Footer -> Last Section
  if (atFooter) {
    atFooter = false;

    sections[sections.length - 1].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  const current = getActiveSectionIndex();

  // First Section -> Footer
  if (current === 0) {
    atFooter = true;

    footer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // Normal previous
  scrollToSection(current - 1);
});


// Start every page reload from the top
// =====================================================
history.scrollRestoration = 'manual';

window.scrollTo(0, 0);

// Start at the top with Play button
playPauseBtn.textContent = '▶';
playPauseBtn.setAttribute('aria-label', 'Play');

updateHeaderSize();
updateProgressBar(0);