(function () {
  const heicPattern = /\.(heic|heif)$/i;

  function isHeic(file) {
    return heicPattern.test(file.name) || /image\/(heic|heif)/i.test(file.type);
  }

  function showStatus(message, isError) {
    let status = document.getElementById("heic-upload-status");
    if (!status) {
      status = document.createElement("div");
      status.id = "heic-upload-status";
      Object.assign(status.style, {
        position: "fixed", right: "20px", bottom: "20px", zIndex: "99999",
        padding: "13px 17px", borderRadius: "8px", color: "#fff",
        fontFamily: "sans-serif", fontSize: "14px", boxShadow: "0 8px 25px rgba(0,0,0,.2)"
      });
      document.body.appendChild(status);
    }
    status.style.background = isError ? "#b71f2b" : "#087f4b";
    status.textContent = message;
    status.hidden = false;
    clearTimeout(status.hideTimer);
    status.hideTimer = setTimeout(() => { status.hidden = true; }, 5000);
  }

  async function convertFile(file) {
    if (!isHeic(file)) return file;
    const converted = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.88 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const baseName = file.name.replace(heicPattern, "");
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  }

  document.addEventListener("change", async function (event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "file" || !input.files?.length) return;
    if (input.dataset.heicConverted === "true") {
      delete input.dataset.heicConverted;
      return;
    }

    const files = Array.from(input.files);
    const heicCount = files.filter(isHeic).length;
    if (!heicCount) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showStatus(`${heicCount} HEIC fotoğraf JPEG'e dönüştürülüyor…`);

    try {
      const convertedFiles = await Promise.all(files.map(convertFile));
      const transfer = new DataTransfer();
      convertedFiles.forEach(file => transfer.items.add(file));
      input.files = transfer.files;
      input.dataset.heicConverted = "true";
      showStatus(`${heicCount} HEIC fotoğraf JPEG'e dönüştürüldü.`);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (error) {
      console.error("HEIC conversion failed", error);
      showStatus("HEIC dönüştürülemedi. Dosyayı JPEG olarak tekrar deneyin.", true);
    }
  }, true);

  function enhanceFileInputs() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
      // Decap'ın varsayılan medya yükleyicisi config'teki `multiple` değerini
      // native dosya alanına her zaman aktarmıyor. Kütüphaneye toplu yüklemeyi aç.
      input.multiple = true;
      const accept = input.getAttribute("accept") || "";
      if (!accept.includes(".heic")) {
        input.setAttribute("accept", [accept, ".heic", ".heif", "image/heic", "image/heif"].filter(Boolean).join(","));
      }
    });
  }

  const observer = new MutationObserver(enhanceFileInputs);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceFileInputs();
}());
