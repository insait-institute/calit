// CALiT project page: figure tabs, the patch-feature explorer, BibTeX copy.
// Without this script the page still works: every tabbed figure is shown, and the explorer shows one frame.
(() => {
  const tabbar = (labels, onPick) => {
    const bar = document.createElement("div");
    bar.className = "tabbar"; bar.setAttribute("role", "tablist");
    labels.forEach((label, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.textContent = label;
      b.addEventListener("click", () => onPick(i));
      bar.append(b);
    });
    bar.select = (i) => [...bar.children].forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
    return bar;
  };

  // Tabbed figures: one at a time.
  for (const box of document.querySelectorAll("[data-tabs]")) {
    const panes = [...box.querySelectorAll(":scope > .stack > figure")];
    const show = (i) => { panes.forEach((p, j) => (p.hidden = i !== j)); bar.select(i); };
    const bar = tabbar(panes.map((p) => p.dataset.tab), show);
    box.prepend(bar);
    show(0);
  }

  // Patch-feature explorer: a pre-training pair and a frame; input, baseline PCA, CALiT PCA.
  const ex = document.getElementById("explorer");
  if (ex) {
    const pairs = [
      { tab: "Supervised ViT-S", base: "deit_s", baseName: "DeiT-S/16", ours: "calit_s_sup", oursName: "CALiT-S" },
      { tab: "DINO ViT-S", base: "dino_s", baseName: "DINO ViT-S/16", ours: "calit_s_dino", oursName: "CALiT-S (DINO)" },
      { tab: "iBOT ViT-S", base: "ibot_s", baseName: "iBOT ViT-S/16", ours: "calit_s_ibot", oursName: "CALiT-S (iBOT)" },
      { tab: "iBOT ViT-B", base: "ibot_b", baseName: "iBOT ViT-B/16", ours: "calit_b_ibot", oursName: "CALiT-B (iBOT)" },
    ];
    const frames = ex.dataset.frames.split(",");
    const [inImg, baseImg, oursImg] = ex.querySelectorAll(".triple img");
    const [, baseCap, oursCap] = ex.querySelectorAll(".triple figcaption");
    const src = (fr, m) => `img/pca/${fr}/${m}.webp`;
    let p = 0, f = 0, touched = false;

    const thumbs = document.createElement("div");
    thumbs.className = "thumbs";
    frames.forEach((fr, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", `Cityscapes frame ${fr}`);
      const t = new Image(72, 72); t.src = src(fr, "thumb"); t.alt = "";
      b.append(t);
      b.addEventListener("click", () => { f = i; render(); });
      thumbs.append(b);
    });
    const bar = tabbar(pairs.map((x) => x.tab), (i) => { p = i; render(); });

    const render = () => {
      const pr = pairs[p], fr = frames[f];
      inImg.src = src(fr, "input"); inImg.alt = `Cityscapes val frame ${fr}, 1024 by 1024 crop`;
      baseImg.src = src(fr, pr.base); baseImg.alt = `Patch-feature PCA of ${pr.baseName}`;
      oursImg.src = src(fr, pr.ours); oursImg.alt = `Patch-feature PCA of ${pr.oursName}`;
      baseCap.textContent = pr.baseName; oursCap.textContent = pr.oursName;
      bar.select(p);
      [...thumbs.children].forEach((b, j) => b.setAttribute("aria-pressed", String(j === f)));
      // Once someone is using the explorer, warm the cache for this pair's other frames.
      if (touched) for (const other of frames) { new Image().src = src(other, pr.base); new Image().src = src(other, pr.ours); }
      touched = true;
    };

    ex.prepend(bar, thumbs);
    ex.tabIndex = -1;
    ex.addEventListener("keydown", (ev) => {
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      f = (f + (ev.key === "ArrowRight" ? 1 : frames.length - 1)) % frames.length;
      render(); thumbs.children[f].focus();
    });
    render();
  }

  const copy = document.getElementById("copy-bib");
  if (copy) copy.addEventListener("click", () => {
    const pre = document.getElementById("bibtex-entry");
    const done = () => { copy.textContent = "Copied"; setTimeout(() => (copy.textContent = "Copy"), 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(pre.innerText).then(done, () => {});
    else {
      const r = document.createRange(); r.selectNodeContents(pre);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); done();
    }
  });
})();
