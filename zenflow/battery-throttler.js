/**
 * Low-Power Battery Throttling Regulator
 * Inspects device power level via navigator.getBattery()
 * to drop background animation frame rates when on battery reserve.
 */

export class BatteryAwareThrottler {
  constructor(onModeChange) {
    this.onModeChange = onModeChange;
    this.isLowPowerMode = false;
    this.init();
  }

  async init() {
    if (typeof navigator === "undefined" || !("getBattery" in navigator)) return;

    try {
      const battery = await navigator.getBattery();
      const evaluatePower = () => {
        // Flag low power if discharging and level < 20%
        const lowPower = !battery.charging && battery.level < 0.2;
        if (lowPower !== this.isLowPowerMode) {
          this.isLowPowerMode = lowPower;
          if (this.onModeChange) {
            this.onModeChange(this.isLowPowerMode);
          }
        }
      };

      battery.addEventListener("levelchange", evaluatePower);
      battery.addEventListener("chargingchange", evaluatePower);
      evaluatePower();
    } catch (e) {
      // Battery API disallowed by permission policy
    }
  }

  getTargetFps() {
    return this.isLowPowerMode ? 30 : 60;
  }
}
