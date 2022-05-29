import { crumbs } from "./crumbs";

export class App {
  private overlayID = "foursite-en-overlay-" + Math.random().toString(36).substring(7);
  private amounts = [35, 75, 100, 250, 500];
  private overlay: HTMLElement;
  private triggered = false;
  private start_unix = 0; // assume time window already started.
  private end_unix = Infinity; // assume time window never ends.
  private options: { [key: string]: string } = {
    cookie_name: "hideOverlay",
    cookie_expiry: "1", // 1 day
    logo: "",
    title: "",
    subtitle: "",
    paragraph: "",
    button_label: "Donate Now",
    image: "",
    other_label: "$ other",
    donation_form: "",
    trigger: "0", // int-seconds, px-scroll location, %-scroll location, exit-mouse leave
  };
  private scriptTag = document.querySelector(
    "script[src*='foursite-en-overlay.js']"
  );
  constructor() {

    this.loadOptions();

    if (!this.shouldRun()) {
      console.log("Overlay Not Running");
      return;
    }

    // Document Load
    if (document.readyState !== "loading") {
      this.run();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        this.run();
      });
    }
  }

  private shouldRun() {
    const hideOverlay = !!parseInt(crumbs.get(this.options.cookie_name)); // Get cookie
    if ( false === hideOverlay ) {
      // If overlay should be shown, also check valid time window.
      const now_unix = ( Date.now() / 1000 ); // unix seconds, not milliseconds.
      // If the time window has started but not yet ended, show the overlay.
      return (
        now_unix >= this.start_unix
        && now_unix < this.end_unix
      );
    }
    return false;
  }

  private run() {
    this.renderOverlay();
    if ( Number(this.options.cookie_expiry) > 0 ) {
      this.setCookie();
    }
  }
  private renderOverlay() {
    let overlayLogoMarkup = "";
    if ( this.options.logo.length ) {
      overlayLogoMarkup = `
        <div class="overlay-logo">
          <img loading="lazy" src="${this.options.logo}">
        </div>
      `;
    }
    const markup = `
            <div class="overlay-container">
                <a href="#" class="button-close"></a>
                <div class="overlay-content">
                    ${overlayLogoMarkup}
                    <div class="overlay-body">
                        <h1 class="overlay-title">${this.options.title}</h1>
                        <h2 class="overlay-subtitle">${
                          this.options.subtitle
                        }</h2>
                        <hr>
                        <p class="overlay-paragraph">${
                          this.options.paragraph
                        }</p>
                        <div class="overlay-form">
                            <form action="${
                              this.options.donation_form
                            }" method="GET">
                              ${this.renderAmounts()}
                              <button class="button button-primary">${
                                this.options.button_label
                              }</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            `;
    const overlay = document.createElement("div");
    overlay.id = this.overlayID;
    overlay.classList.add("is-hidden");
    overlay.classList.add("foursite-en-overlay");
    if (this.options.image) {
      overlay.classList.add("has-image");
      overlay.style.backgroundImage = `url(${this.options.image})`;
    }
    overlay.innerHTML = markup;
    const closeButton = overlay.querySelector(
      ".button-close"
    ) as HTMLLinkElement;
    closeButton.addEventListener("click", this.close.bind(this));
    // I've commented out the following line because the overlay is fullscreen, so there's no "click outside to close" functionality

    // overlay.addEventListener("click", (e: MouseEvent | KeyboardEvent) => {
    //   if ((e.target as HTMLDivElement).id === this.overlayID) {
    //     this.close(e);
    //   }
    // });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeButton.click();
      }
    });
    const otherAmount = overlay.querySelector(
      "input[name='transaction.donationAmt'].form-text"
    );
    if (otherAmount) {
      otherAmount.addEventListener("focus", () => {
        // Uncheck all other amounts
        const inputs = overlay.querySelectorAll(
          "input[type='radio']"
        ) as NodeListOf<HTMLInputElement>;
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          input.checked = false;
        }
      });
    }

    this.overlay = overlay;
    document.body.appendChild(overlay);
    const triggerType = this.getTriggerType(this.options.trigger);
    if (triggerType === false) {
      this.options.trigger = "2000";
    }
    if (triggerType === "seconds") {
      this.options.trigger = (Number(this.options.trigger) * 1000).toString();
    }
    if (triggerType === "seconds" || triggerType === false) {
      window.setTimeout(this.open.bind(this), Number(this.options.trigger));
    }
    if (triggerType === "exit") {
      document.body.addEventListener("mouseout", (e) => {
        if (e.clientY < 0 && !this.triggered) {
          this.open();
          this.triggered = true;
        }
      });
    }
    if (triggerType === "pixels") {
      document.addEventListener(
        "scroll",
        this.scrollTriggerPx.bind(this),
        true
      );
    }
    if (triggerType === "percent") {
      document.addEventListener(
        "scroll",
        this.scrollTriggerPercent.bind(this),
        true
      );
    }
  }
  private renderAmounts() {
    let amounts = `<div class="overlay-amounts">`;
    amounts += this.amounts
      .map((amount) => {
        return `
      <div class="form-item form-type-radio form-item-amount">
        <input type="radio" id="edit-amount-${amount}" name="transaction.donationAmt" value="${amount}">  
        <label class="option" for="edit-amount-${amount}">$${amount}</label>
      </div>
      `;
      })
      .join("");
    if (this.options.other_label) {
      amounts += `
        <div class="form-item form-type-textfield form-item-other">
          <input placeholder="${this.options.other_label}" type="text" name="transaction.donationAmt" value="" class="form-text">
        </div>
        `;
    }
    amounts += `</div>`;
    return amounts;
  }

  private getTriggerType(trigger: string) {
    /**
     * Any integer (e.g., 5) -> Number of seconds to wait before triggering the lightbox
     * Any pixel (e.g.: 100px) -> Number of pixels to scroll before trigger the lightbox
     * Any percentage (e.g., 30%) -> Percentage of the height of the page to scroll before triggering the lightbox
     * The word exit -> Triggers the lightbox when the mouse leaves the DOM area (exit intent).
     * With 0 as default, the lightbox will trigger as soon as the page finishes loading.
     */

    if (!isNaN(Number(trigger))) {
      return "seconds";
    } else if (trigger.includes("px")) {
      return "pixels";
    } else if (trigger.includes("%")) {
      return "percent";
    } else if (trigger.includes("exit")) {
      return "exit";
    } else {
      return false;
    }
  }
  private scrollTriggerPx() {
    const triggerValue = Number(this.options.trigger.replace("px", ""));
    if (window.scrollY >= triggerValue && !this.triggered) {
      this.open();
      this.triggered = true;
    }
  }
  private scrollTriggerPercent() {
    const triggerValue = Number(this.options.trigger.replace("%", ""));
    const clientHeight = document.documentElement.clientHeight;
    const scrollHeight = document.documentElement.scrollHeight - clientHeight;
    const target = (triggerValue / 100) * scrollHeight;
    if (window.scrollY >= target && !this.triggered) {
      this.open();
      this.triggered = true;
    }
  }
  private setCookie() {
    crumbs.set(this.options.cookie_name, 0, {
      type: "day",
      value: this.options.cookie_expiry,
    });
  }
  private loadOptions() {
    this.amounts = this.getScriptData("amounts", "35,75,100,250,500")
      .split(",")
      .map((amount) => parseInt(amount));
    this.start_unix = Number(this.getScriptData("start_unix", String(this.start_unix)));
    this.end_unix = Number(this.getScriptData("end_unix", String(this.end_unix)));
    // Load options from script tag
    for (const key in this.options) {
      if (key in this.options) {
        this.options[key] = this.getScriptData(key, this.options[key]);
      }
    }
  }
  private getScriptData(attribute: string, defaultValue = "") {
    if (this.scriptTag) {
      const data = this.scriptTag.getAttribute("data-" + attribute);
      return data ?? defaultValue;
    }
    return defaultValue;
  }
  private open() {
    this.overlay.classList.remove("is-hidden");
    document.body.classList.add("has-modal");
  }
  private close(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    crumbs.set(this.options.cookie_name, 1, {
      type: "day",
      value: this.options.cookie_expiry,
    }); // Create a cookie
    this.overlay.classList.add("is-hidden");
    document.body.classList.remove("has-modal");
  }
}
