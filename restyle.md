<!DOCTYPE html><html class="light" lang="en" style=""><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>image2cpp | Image to Byte Array Converter</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-container": "#004538",
                    "on-tertiary": "#ffffff",
                    "surface-variant": "#e0e3e5",
                    "on-primary-fixed": "#002019",
                    "on-secondary-fixed": "#091d2e",
                    "border-subtle": "#E2E8F0",
                    "outline": "#6c7a75",
                    "inverse-surface": "#2d3133",
                    "tertiary-container": "#fa866f",
                    "tertiary-fixed-dim": "#ffb4a5",
                    "success-teal": "#1ABC9C",
                    "secondary-fixed-dim": "#b5c8df",
                    "inverse-on-surface": "#eff1f3",
                    "on-secondary-container": "#526478",
                    "surface-container-low": "#f2f4f6",
                    "on-tertiary-fixed-variant": "#7f2a1a",
                    "on-primary": "#ffffff",
                    "editor-bg": "#1E1E1E",
                    "secondary": "#4e6073",
                    "surface-tint": "#006b58",
                    "primary-container": "#1abc9c",
                    "on-secondary": "#ffffff",
                    "tertiary": "#9f402e",
                    "on-surface": "#191c1e",
                    "on-primary-fixed-variant": "#005141",
                    "text-muted": "#64748B",
                    "tertiary-fixed": "#ffdad3",
                    "surface-bright": "#f7f9fb",
                    "on-tertiary-fixed": "#3f0400",
                    "error": "#ba1a1a",
                    "on-surface-variant": "#3c4a45",
                    "inverse-primary": "#4eddbb",
                    "primary": "#006b58",
                    "surface-container": "#eceef0",
                    "surface-container-high": "#e6e8ea",
                    "error-container": "#ffdad6",
                    "on-error": "#ffffff",
                    "primary-fixed-dim": "#4eddbb",
                    "surface-container-lowest": "#ffffff",
                    "secondary-container": "#cfe2f9",
                    "surface-dim": "#d8dadc",
                    "on-secondary-fixed-variant": "#36485b",
                    "background": "#f7f9fb",
                    "surface": "#f7f9fb",
                    "on-tertiary-container": "#711f10",
                    "outline-variant": "#bbcac3",
                    "on-background": "#191c1e",
                    "surface-container-highest": "#e0e3e5",
                    "secondary-fixed": "#d1e4fb",
                    "on-error-container": "#93000a",
                    "primary-fixed": "#6ff9d6"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "step-gap": "48px",
                    "container-max": "1200px",
                    "margin-desktop": "40px",
                    "margin-mobile": "16px",
                    "gutter": "24px"
            },
            "fontFamily": {
                    "body-md": ["Inter"],
                    "headline-lg-mobile": ["Inter"],
                    "code-block": ["JetBrains Mono"],
                    "body-sm": ["Inter"],
                    "headline-lg": ["Inter"],
                    "label-mono": ["JetBrains Mono"],
                    "headline-md": ["Inter"]
            },
            "fontSize": {
                    "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                    "code-block": ["14px", {"lineHeight": "22px", "fontWeight": "400"}],
                    "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-lg": ["30px", {"lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
                    "label-mono": ["13px", {"lineHeight": "16px", "fontWeight": "500"}],
                    "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .step-active { color: #006b58; }
        .step-line { position: absolute; left: 19px; top: 40px; bottom: -20px; width: 2px; background-color: #E2E8F0; }
        .last-step-line { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen">
<!-- TopNavBar -->
<header class="bg-surface dark:bg-background border-b border-border-subtle dark:border-outline-variant full-width top-0 sticky z-50">
<div class="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
<div class="flex items-center gap-8">
<span class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim cursor-pointer">image2cpp</span>
<nav class="hidden md:flex gap-6 font-body-md text-body-md"><a class="text-secondary dark:text-secondary-fixed-dim hover:text-primary transition-colors cursor-pointer" href="#">GitHub</a></nav>
</div>
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer" data-icon="dark_mode">dark_mode</button>
<button class="bg-primary-container text-on-primary-container px-4 py-2 font-label-mono text-label-mono rounded-lg hover:opacity-90 active:opacity-80 transition-all"><div class="">Reset page</div></button>
</div>
</div>
</header>
<div class="flex max-w-container-max mx-auto">
<!-- SideNavBar -->
<aside class="hidden lg:flex flex-col py-6 h-screen w-64 fixed left-0 top-16 bg-surface-container-low dark:bg-surface-container border-r border-border-subtle dark:border-outline-variant">
<div class="px-6 mb-8">
<h2 class="font-headline-md text-headline-md text-primary">Workflow</h2>
<p class="font-body-sm text-body-sm text-text-muted">Conversion Steps</p>
</div>
<nav class="flex-1 space-y-1 font-label-mono text-label-mono">
<div class="flex items-center gap-3 text-primary dark:text-primary-fixed-dim font-bold bg-primary-container/10 dark:bg-primary-container/20 border-r-4 border-primary dark:border-primary-fixed-dim py-3 px-6 cursor-pointer hover:bg-surface-container-high transition-all">
<span class="material-symbols-outlined" data-icon="upload_file">upload_file</span>
<span class="">1. Select Image</span>
</div>
<div class="flex items-center gap-3 text-secondary dark:text-secondary-fixed-dim py-3 px-6 cursor-pointer hover:bg-surface-container-high transition-all">
<span class="material-symbols-outlined" data-icon="tune">tune</span>
<span class="">2. Settings</span>
</div>
<div class="flex items-center gap-3 text-secondary dark:text-secondary-fixed-dim py-3 px-6 cursor-pointer hover:bg-surface-container-high transition-all">
<span class="material-symbols-outlined" data-icon="visibility">visibility</span>
<span class="">3. Preview</span>
</div>
<div class="flex items-center gap-3 text-secondary dark:text-secondary-fixed-dim py-3 px-6 cursor-pointer hover:bg-surface-container-high transition-all">
<span class="material-symbols-outlined" data-icon="code">code</span>
<span class="">4. Output</span>
</div>
</nav>
<div class="p-6 mt-auto"><button class="w-full bg-secondary text-on-secondary py-2 rounded font-label-mono text-label-mono hover:bg-on-secondary-container transition-colors">Export All</button></div></aside>
<!-- Main Content -->
<main class="flex-1 lg:ml-64 px-margin-desktop py-12 max-w-4xl mx-auto">
<div class="mb-12">
<h1 class="font-headline-lg text-headline-lg mb-2">Image to C++ Converter</h1>
<p class="text-text-muted">Generate monochrome byte arrays for OLED displays on Arduino or Raspberry Pi. All processing happens in your browser.</p>
<div class="flex items-center gap-4 mt-4"><span class="text-text-muted font-body-sm">Support on</span><a class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" href="#"><span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">favorite</span></a><a class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" href="#"><span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">coffee</span></a></div></div>
<!-- Workflow Steps -->
<div class="space-y-step-gap">
<!-- Step 1: Select Image -->
<section class="relative pl-12" id="step-1">
<div class="step-line"></div>
<div class="absolute left-0 top-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary font-bold shadow-sm z-10">1</div>
<div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-8 space-y-6">
<div class="flex flex-col md:flex-row gap-6">
<div class="flex-1">
<label class="block font-label-mono text-label-mono text-primary mb-2">Upload Image File</label>
<div class="border-2 border-dashed border-outline-variant rounded-lg p-10 flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group">
<span class="material-symbols-outlined text-4xl text-outline mb-3 group-hover:scale-110 transition-transform" data-icon="cloud_upload">cloud_upload</span>
<p class="font-body-md text-body-md text-on-surface-variant text-center">Drag and drop images here or <span class="text-primary font-bold">Browse</span></p>
<p class="font-body-sm text-body-sm text-text-muted mt-2">Supports JPG, PNG, BMP, GIF</p>
<input class="hidden" multiple="" type="file">
</div>
</div>
<div class="flex-1">
<label class="block font-label-mono text-label-mono text-primary mb-2">Or Paste Byte Array</label>
<textarea class="w-full h-[180px] bg-surface-container text-on-surface-variant font-code-block text-code-block p-4 rounded-lg border-none focus:ring-2 focus:ring-primary focus:outline-none resize-none" placeholder="0xFF, 0x00, 0xAA..."></textarea>
</div>
</div>
</div>
</section>
<!-- Step 2: Settings -->
<section class="relative pl-12" id="step-2">
<div class="step-line"></div>
<div class="absolute left-0 top-0 w-10 h-10 bg-surface-container-high border border-border-subtle rounded-full flex items-center justify-center text-secondary font-bold z-10">2</div>
<div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-8 space-y-8">
<div class="flex justify-between items-center mb-6"><h3 class="font-headline-md text-headline-md text-on-surface">Image Configuration</h3><div class="flex gap-2"><button class="p-1 text-secondary hover:text-primary transition-colors"></button></div></div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-gutter gap-y-8">
<!-- Canvas Size -->
<div>
<label class="block font-label-mono text-label-mono text-primary mb-3">Canvas Size (px)</label>
<div class="flex items-center gap-2">
<input class="w-full bg-surface-container border-none rounded p-2 font-label-mono" type="number" value="128">
<span class="text-outline">×</span>
<input class="w-full bg-surface-container border-none rounded p-2 font-label-mono" type="number" value="64">
</div>
</div>
<!-- Background Color -->
<div>
<label class="block font-label-mono text-label-mono text-primary mb-3">Background Color</label>
<div class="flex gap-1 bg-surface-container p-1 rounded-lg">
<button class="flex-1 py-1.5 rounded text-label-mono bg-on-secondary-container text-white shadow-sm">White</button>
<button class="flex-1 py-1.5 rounded text-label-mono text-secondary hover:bg-surface-container-high">Black</button>
<button class="flex-1 py-1.5 rounded text-label-mono text-secondary hover:bg-surface-container-high">Transp.</button>
</div>
</div>
<!-- Scaling -->
<div>
<label class="block font-label-mono text-label-mono text-primary mb-3">Scaling</label>
<select class="w-full bg-surface-container border-none rounded p-2 font-body-sm focus:ring-primary">
<option>Original Size</option>
<option>Scale to Fit</option>
<option>Stretch to Fill</option>
<option>Stretch Horizontally</option>
<option>Stretch Vertically</option>
</select>
</div>
<!-- Dithering -->
<div>
<label class="block font-label-mono text-label-mono text-primary mb-3">Dithering Algorithm</label>
<select class="w-full bg-surface-container border-none rounded p-2 font-body-sm focus:ring-primary">
<option>Binary (Threshold)</option>
<option>Bayer (Ordered)</option>
<option>Floyd-Steinberg</option>
<option>Atkinson</option>
</select>
</div>
<!-- Brightness -->
<div>
<label class="block font-label-mono text-label-mono text-primary mb-3">Threshold (0-255)</label>
<div class="flex items-center gap-4">
<input class="flex-1 accent-primary" max="255" min="0" type="range" value="128">
<span class="font-label-mono text-primary">128</span>
</div>
</div>
<!-- Toggles -->
<div class="">
<label class="block font-label-mono text-label-mono text-primary mb-3">Image Adjustments</label>
<div class="space-y-4">
<label class="flex items-center gap-3 cursor-pointer">
<div class="relative inline-flex items-center">
<input class="sr-only peer" type="checkbox">
<div class="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</div>
<span class="font-body-sm">Invert Colors</span>
</label>
<div class="flex gap-4">
<button class="flex items-center gap-2 text-label-mono text-secondary hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">rotate_right</span> Rotate Image</button>
<button class="flex items-center gap-2 text-label-mono text-secondary hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">flip</span> Flip Image</button>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Step 3: Preview -->
<section class="relative pl-12" id="step-3">
<div class="step-line"></div>
<div class="absolute left-0 top-0 w-10 h-10 bg-surface-container-high border border-border-subtle rounded-full flex items-center justify-center text-secondary font-bold z-10">3</div>
<div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-8">
<div class="flex justify-between items-center mb-6">
<h3 class="font-headline-md text-headline-md text-on-surface">Preview</h3>
<div class="flex gap-2">
<button class="p-1 text-secondary hover:text-primary transition-colors"></button>
<button class="p-1 text-secondary hover:text-primary transition-colors"></button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
<div class="space-y-3">
<span class="font-label-mono text-label-mono text-text-muted">Original</span>
<div class="aspect-video bg-surface-container-high rounded-lg flex items-center justify-center border border-dashed border-outline-variant relative overflow-hidden">
<img class="max-w-full max-h-full object-contain" data-alt="A clean, high-resolution original digital photo of a detailed robot head against a neutral gray background. The lighting is crisp and highlights the mechanical textures and metallic finishes. The composition is centered, creating a professional studio-quality look for image processing software. The aesthetic is tech-focused and minimal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq1r2m_Da66R4eXvBlWq7d0AICWfEENZNfsexBvtCHmM5luhvCaPECRItz1w85o1XVfQtgy1XdkamKUDYAaRIQBJHQTB1Mt8pfbUMK7GNzDWYCQx6MUC1DEqnG0QSJBPc_zMJj6hZPoBKjAz_NUOg-mD4nC2cszzgH8dPaU_Z1B5fGEeHecdKtRIlPwCAjuArVWmSh1ayhApkbopqBSNOWmVjLk0RX5VkT_IwoHSYQFYFTtWJqAShF1g">
</div>
</div>
<div class="space-y-3">
<span class="font-label-mono text-label-mono text-text-muted">Converted (1-bit)</span>
<div class="aspect-video bg-editor-bg rounded-lg flex items-center justify-center border border-on-surface-variant relative overflow-hidden">
<!-- This would be the canvas rendering -->
<img class="max-w-full max-h-full object-contain grayscale brightness-200 contrast-200" data-alt="A stylized 1-bit black and white monochrome rendering of the previous robot head image. The image is pixelated and high-contrast, mimicking an OLED display output with crisp white pixels on a deep black background. The conversion uses a dithered effect to represent shadows, creating a high-tech retro-digital aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPXPnQHpXR6vyt7gdrlrgvIepXIaQ6-86RRIK88PdiKphM3fnxyX1eP2V4py6FTykrNAL4OpC8kmEFdzZhRfjPtMOmqisw66exgyOzOF6keumlvHUzPvVrBeWj7cr2gB88geHSizBpGdRxu8N30B0Kgl9VEdLwrE2juDzZM7169j4gPDbn6UcyKHHSjvMmkSGbynfboN3URFYfDA1CsyegObewcHcJ--8-gMSF1OzJ57FqHbvzpMjEtQ">
</div>
</div>
</div>
</div>
</section>
<!-- Step 4: Output -->
<section class="relative pl-12" id="step-4">
<div class="step-line last-step-line"></div>
<div class="absolute left-0 top-0 w-10 h-10 bg-surface-container-high border border-border-subtle rounded-full flex items-center justify-center text-secondary font-bold z-10">4</div>
<div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-8 space-y-8">
<div class="flex flex-col lg:flex-row justify-between items-start gap-8">
<div class="w-full lg:w-1/3 space-y-6">
<h3 class="font-headline-md text-headline-md text-on-surface">Output Settings</h3>
<div class="space-y-4">
<div>
<label class="block font-label-mono text-label-mono text-primary mb-2">Output Format</label>
<select class="w-full bg-surface-container border-none rounded p-2 font-body-sm focus:ring-primary">
<option>Plain bytes</option>
<option selected="">Arduino code</option>
<option>Arduino code (Single Bitmap)</option>
<option>Adafruit GFX Bitmap Font</option>
</select>
</div>
<div>
<label class="block font-label-mono text-label-mono text-primary mb-2">Identifier / Prefix</label>
<input class="w-full bg-surface-container border-none rounded p-2 font-label-mono focus:ring-primary" type="text" value="myBitmap">
</div>
<div>
<label class="block font-label-mono text-label-mono text-primary mb-2">Draw Mode</label>
<select class="w-full bg-surface-container border-none rounded p-2 font-body-sm focus:ring-primary">
<option>Horizontal - 1 bit per pixel</option>
<option>Vertical - 1 bit per pixel</option>
<option>Horizontal - 2 bytes per pixel (565)</option>
</select>
</div>
<div class="pt-2 space-y-3">
<label class="flex items-center gap-3 cursor-pointer">
<input class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox">
<span class="font-body-sm">Swap bits in byte</span>
</label>
<label class="flex items-center gap-3 cursor-pointer">
<input class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox">
<span class="font-body-sm">Remove '0x' and commas</span>
</label>
</div>
</div>
</div>
<div class="w-full lg:w-2/3 space-y-4">
<div class="flex justify-between items-end">

<div class="flex gap-2">
<button class="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-mono text-label-mono hover:bg-on-primary-fixed-variant transition-all flex items-center gap-2">
<span class="material-symbols-outlined text-sm" data-icon="play_arrow">play_arrow</span> Generate
                                        </button>
<button class="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-mono text-label-mono hover:bg-surface-container-highest transition-all flex items-center gap-2">
<span class="material-symbols-outlined text-sm" data-icon="content_copy">content_copy</span> Copy
                                        </button>
<button class="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-mono text-label-mono hover:opacity-90 transition-all flex items-center gap-2">
<span class="material-symbols-outlined text-sm" data-icon="download">download</span> .bin
                                        </button>
</div>
</div>
<div class="bg-editor-bg rounded-xl p-6 font-code-block text-code-block text-white overflow-hidden border border-on-surface-variant h-[400px] flex flex-col">
<div class="flex-1 overflow-auto custom-scrollbar">
<pre class="text-green-400 opacity-60 italic mb-2">// Generated by image2cpp
// 128x64px, myBitmap
</pre>
<code class="block text-[#dcdcaa]">const unsigned char myBitmap [] PROGMEM = {
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff,
    0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
};</code>
</div>
<div class="bg-surface-container-low p-4 rounded-lg flex items-start gap-3">
<span class="material-symbols-outlined text-primary text-xl" data-icon="info">info</span>
<p class="font-body-sm text-body-sm text-on-secondary-container leading-relaxed">If the preview looks scrambled on your hardware, try switching the <strong>Draw Mode</strong> between Horizontal and Vertical.
                                    </p>
</div>
</div>
</div>
</div>
</div></section>
</div>
</main>
</div>
<!-- Footer -->
<script>
        // Simple interactivity for demonstration
        document.querySelectorAll('nav div, nav a').forEach(item => {
            item.addEventListener('click', function() {
                // Remove active classes from all
                document.querySelectorAll('nav div').forEach(d => {
                    d.classList.remove('text-primary', 'font-bold', 'bg-primary-container/10', 'border-r-4', 'border-primary');
                    d.classList.add('text-secondary');
                });
                // Add to clicked
                if (this.tagName === 'DIV') {
                    this.classList.add('text-primary', 'font-bold', 'bg-primary-container/10', 'border-r-4', 'border-primary');
                    this.classList.remove('text-secondary');
                }
            });
        });

        // Sticky side nav highlight on scroll logic could be added here
    </script>


</body></html>
