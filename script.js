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
let returningToTop = false;
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

  if (scrollTop > 0) {
    // Ignore scroll events while returning to top
    returningToTop = true;

    // Go to the top instantly
    window.scrollTo(0, 0);

    // Force the button to stay Pause
    playPauseBtn.textContent = '⏸';
    playPauseBtn.setAttribute('aria-label', 'Pause');

    updateProgressBar(0);

    // Keep ignoring any delayed scroll event
    setTimeout(() => {
      returningToTop = false;

      // Force Pause again after scroll event finishes
      playPauseBtn.textContent = '⏸';
      playPauseBtn.setAttribute('aria-label', 'Pause');
    }, 50);

    return;
  }

  // Already at the top
  playPauseBtn.textContent = '⏸';
  playPauseBtn.setAttribute('aria-label', 'Pause');
});

// =====================================================
// Next / Previous section navigation
// =====================================================

// Finds the index of the section the user is currently viewing, by checking
// which section's top edge has already scrolled past the header.
function getActiveSectionIndex() {
  const headerOffset = document.getElementById('player').offsetHeight;
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
  // Clamp so we never try to scroll to a section that doesn't exist
  const clamped = Math.min(sections.length - 1, Math.max(0, index));
  sections[clamped].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

nextBtn.addEventListener('click', () => {
  const current = getActiveSectionIndex();
  scrollToSection(current + 1);
});

prevBtn.addEventListener('click', () => {
  const current = getActiveSectionIndex();
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