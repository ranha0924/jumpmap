const ARROWS = {
  '+X': '→', '-X': '←',
  '+Y': '↑', '-Y': '↓',
  '+Z': '⤢', '-Z': '⤡',
};

export class HUD {
  constructor() {
    this.elStage = document.getElementById('stage-name');
    this.elTimer = document.getElementById('timer');
    this.elArrow = document.getElementById('gravity-arrow');
    this.elAxis = document.getElementById('gravity-axis');
    this.elShifts = document.getElementById('shifts-remaining');
    this.elToast = document.getElementById('checkpoint-toast');
    this.elGoal = document.getElementById('goal-toast');
    this._toastTimer = null;
  }

  setStageName(name) {
    this.elStage.textContent = name;
  }

  setTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    this.elTimer.textContent =
      `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }

  setGravity(axisLabel) {
    this.elAxis.textContent = axisLabel;
    this.elArrow.textContent = ARROWS[axisLabel] || '↓';
  }

  setShifts(n) {
    this.elShifts.textContent = n === Infinity ? '∞' : String(n);
  }

  toast(text, durationMs = 1500) {
    this.elToast.textContent = text;
    this.elToast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.elToast.classList.remove('visible');
    }, durationMs);
  }

  showGoal() {
    this.elGoal.classList.remove('hidden');
  }

  hideGoal() {
    this.elGoal.classList.add('hidden');
  }
}
