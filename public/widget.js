/**
 * HapGiveaway Embeddable Widget
 *
 * Usage:
 *   <div id="hap-giveaway" data-slug="my-giveaway"></div>
 *   <script src="https://hapgiveaway.com/widget.js" async></script>
 *
 * Optional attributes on the container div:
 *   data-width="100%"      (default: 100%)
 *   data-height="600"      (default: 600)
 *   data-theme="light"     (default: light, options: light, dark)
 */
(function () {
  "use strict";

  var BASE_URL = "https://hapgiveaway.com";

  function init() {
    var containers = document.querySelectorAll("[data-slug][id='hap-giveaway'], .hap-giveaway");
    if (containers.length === 0) {
      // Fallback: find by data-hap-slug attribute
      containers = document.querySelectorAll("[data-hap-slug]");
    }

    containers.forEach(function (container) {
      var slug = container.getAttribute("data-slug") || container.getAttribute("data-hap-slug");
      if (!slug) return;

      var width = container.getAttribute("data-width") || "100%";
      var height = container.getAttribute("data-height") || "600";
      var theme = container.getAttribute("data-theme") || "light";

      // Capture referral code from URL if present
      var urlParams = new URLSearchParams(window.location.search);
      var ref = urlParams.get("ref") || "";

      var src = BASE_URL + "/g/" + encodeURIComponent(slug) + "/embed?theme=" + encodeURIComponent(theme) + (ref ? "&ref=" + encodeURIComponent(ref) : "");

      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.width = width;
      iframe.height = height;
      iframe.frameBorder = "0";
      iframe.scrolling = "no";
      iframe.style.border = "none";
      iframe.style.maxWidth = "100%";
      iframe.allow = "clipboard-write";
      iframe.title = "Giveaway Entry Form";

      // Responsive height via postMessage
      window.addEventListener("message", function (event) {
        if (event.origin !== BASE_URL) return;
        if (event.data && event.data.type === "hap:resize" && event.data.slug === slug) {
          iframe.height = event.data.height;
        }
      });

      container.innerHTML = "";
      container.appendChild(iframe);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
