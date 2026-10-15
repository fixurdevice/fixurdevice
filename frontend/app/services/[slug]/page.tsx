import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Truck,
  Shield,
  Clock,
  Star,
  MessageSquare,
  Phone,
  AlertCircle,
  Wrench,
  Check,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";

type ServiceDetail = {
  title: string;
  badge: string;
  image: string;
  description: string;
  longDescription: string;
  turnaround: string;
  partQuality: string;
  symptoms: string[];
  processSteps: { step: number; title: string; desc: string }[];
  features: string[];
  whatsIncluded: string[];
  suitableFor: string[];
  faq: { q: string; a: string }[];
};

const serviceData: Record<string, ServiceDetail> = {
  "screen-replacement": {
    title: "Screen Replacement in Bangalore",
    badge: "Most Requested Service",
    image: "/images/services/screen-replacement.jpg",
    description:
      "Cracked, shattered, or unresponsive display? We install premium OEM-grade display panels for iPhones, Android smartphones, and tablets across Bangalore with doorstep pickup & delivery.",
    longDescription:
      "A cracked glass, bleeding OLED panel, or unresponsive touch digitizer does not mean you have to replace your entire smartphone. FixUrDevice provides specialized screen replacement using high-grade, color-calibrated OEM panels. Our technicians transfer critical display data (including Apple True Tone where supported), install water-resistant frame adhesives, and run a 24-point display and touch diagnostic before returning your device.",
    turnaround: "Same Day or 24 Hours",
    partQuality: "Premium OEM / Original Specification",
    symptoms: [
      "Cracked, shattered front glass or spiderweb fractures",
      "Black screen, ink-like bleeding spots, or colored vertical lines",
      "Touch screen unresponsive, phantom touch ('ghost typing'), or dead spots",
      "Flickering display, green tint, or dim backlight",
      "Separation between display glass and device chassis",
    ],
    processSteps: [
      {
        step: 1,
        title: "Microscope & Digitizer Diagnostic",
        desc: "We inspect whether the damage is limited to the outer glass or affects the underlying OLED/LCD panel, digitizer touch layer, and front sensor flex.",
      },
      {
        step: 2,
        title: "Thermal Separation & ESD-Safe Disassembly",
        desc: "Using calibrated thermal heating plates and antistatic tools, the damaged display is decoupled safely without stressing delicate internal motherboard logic.",
      },
      {
        step: 3,
        title: "True Tone & Component Transfer",
        desc: "For iPhones, original serial data is read and programmed into the new screen using specialized hardware to retain True Tone and ambient light auto-brightness.",
      },
      {
        step: 4,
        title: "Water-Resistance Resealing & 24-Point QC",
        desc: "A fresh laser-cut perimeter adhesive gasket is installed. We conduct multi-touch, multi-point color calibration, proximity sensor, and audio speaker verification before delivery.",
      },
    ],
    features: [
      "Retina, OLED, Super AMOLED, and Fluid Display support",
      "True Tone data transfer & ambient sensor calibration",
      "Fresh water-resistant perimeter seal installed",
      "High touch sampling rate and 100% color gamut tested",
      "Transparent diagnosis and upfront quotation before any work",
    ],
    whatsIncluded: [
      "Scheduled pickup from your doorstep anywhere in Bangalore",
      "Full hardware intake check and physical condition logging",
      "OEM-grade display unit installation upon your written approval",
      "24-point quality inspection: touch grid, brightness, sensors, and camera",
      "Safe packaging and insured delivery back to your doorstep",
    ],
    suitableFor: [
      "Apple iPhone 15 / 15 Pro / 15 Plus / 15 Pro Max",
      "Apple iPhone 14 / 14 Pro / 13 / 12 / 11 / X / XR / 8 Series",
      "Samsung Galaxy S24 / S23 / S22 / Note / Z Fold & Flip",
      "OnePlus 12 / 11 / 10 / 9 / Nord Series",
      "Google Pixel 8 / 7 / 6 / 6a / 7a",
      "Xiaomi, Redmi, POCO, Realme, Vivo & iQOO",
    ],
    faq: [
      {
        q: "Will my phone's touch sensitivity and colors feel identical to the original?",
        a: "Yes. We source high-grade OEM panels calibrated for standard color gamut, brightness (nits), and high-frequency touch response so your phone performs smoothly.",
      },
      {
        q: "What happens to my personal data during a screen replacement?",
        a: "Our technicians work purely on hardware components and never require your device password unless you specifically authorize a touch test. We still strongly suggest backing up your device before handing it over.",
      },
      {
        q: "How long does the screen replacement process take?",
        a: "Standard screen replacements are completed within 4 to 24 hours of receiving the device at our Jayanagar lab. We keep you notified via WhatsApp and SMS throughout.",
      },
      {
        q: "Do you provide a warranty on replaced screens?",
        a: "Yes! All replaced screens come with a warranty covering manufacturing and touch responsiveness defects. Physical breakage or liquid ingress post-repair is excluded.",
      },
    ],
  },

  "battery-replacement": {
    title: "Battery Replacement in Bangalore",
    badge: "Certified Battery Health Service",
    image: "/images/services/battery-replacement.jpg",
    description:
      "Is your phone draining rapidly, shutting down at 20%, overheating, or swollen? We install certified high-capacity battery units with thermal tape and safety diagnostics.",
    longDescription:
      "All lithium-ion batteries degrade after 500 charge cycles, typically around 18 to 24 months of daily use. Signs include rapid discharge, sluggish system performance (Apple CPU throttling), random shutdowns under heavy load, or a bulging back glass. FixUrDevice replaces aged batteries with brand-new certified high-capacity cells, safe pull-tab adhesive strips, and cycle-count reset procedures.",
    turnaround: "2 to 6 Hours (Same Day)",
    partQuality: "Certified High-Capacity Grade-A Cells",
    symptoms: [
      "Battery percentage drops rapidly even during light use",
      "Device unexpectedly turns off when taking photos or playing video",
      "iPhone Battery Health indicates below 80% or 'Service Recommended'",
      "Phone chassis feels unusually hot during normal charging",
      "Screen lifting or back glass pushing out (sign of swollen battery danger)",
    ],
    processSteps: [
      {
        step: 1,
        title: "Battery Health & Cycle Count Diagnostics",
        desc: "We analyze current milliampere-hour (mAh) capacity, internal impedance, and charge cycle count to confirm whether battery degradation is the sole culprit.",
      },
      {
        step: 2,
        title: "Safe Removal of Aged Lithium Cells",
        desc: "Degraded batteries are delicately removed using chemical debonding agents and stretch-release tabs without puncturing or bending the reactive cell.",
      },
      {
        step: 3,
        title: "High-Capacity Cell & Thermal Pad Installation",
        desc: "We install fresh OEM-spec cells fitted with genuine thermal conductive adhesive strips to allow optimal heat dissipation across the chassis.",
      },
      {
        step: 4,
        title: "Fast Charge & Thermal Dissipation Testing",
        desc: "The device is connected to our charging analyzer to monitor voltage stability, peak watt draw, and temperature regulation from 0% to 100%.",
      },
    ],
    features: [
      "Zero-cycle brand new lithium-ion and lithium-polymer cells",
      "Full 100% battery health capability and performance restored",
      "Original stretch-release thermal pull tabs applied",
      "Protective BMS circuit board prevents overcharging and short circuits",
      "Doorstep pickup and return across Bangalore",
    ],
    whatsIncluded: [
      "Battery capacity and power management IC diagnostic",
      "Removal and environmentally safe recycling of the old swollen battery",
      "Fresh high-capacity battery installation",
      "100% full-charge cycle validation and thermal test",
      "Doorstep delivery back to your address in Bangalore",
    ],
    suitableFor: [
      "All Apple iPhones (iPhone 15, 14, 13, 12, 11, SE, X, 8, 7)",
      "Samsung Galaxy S & Note Series (S24, S23, S22, S21, Note 20)",
      "OnePlus Series (12, 11, 10 Pro, 9 Pro, 8T, Nord)",
      "Google Pixel (Pixel 8, 7, 6, 5)",
      "Apple iPad & MacBook battery replacements (select models)",
    ],
    faq: [
      {
        q: "Will my iPhone show 100% battery health after replacement?",
        a: "Yes, our certified batteries restore 100% maximum capacity and eliminate CPU performance throttling so your device runs at peak capability.",
      },
      {
        q: "What should I do if my phone battery is visibly bulging or pushing the screen?",
        a: "Stop charging the device immediately, do not apply pressure, and keep it in a cool, ventilated space. Request an urgent pickup with us so we can safely extract it.",
      },
      {
        q: "How long does a new battery last?",
        a: "A new battery will generally last between 500 and 800 full charge cycles, which translates to roughly 2 to 3 years of daily usage.",
      },
    ],
  },

  "water-damage-repair": {
    title: "Water Damage & Liquid Recovery in Bangalore",
    badge: "Specialized Clean Lab",
    image: "/images/services/water-damage-repair.jpg",
    description:
      "Dropped your phone in water, coffee, or rain? Don't turn it on! Our lab uses ultrasonic chemical board washing and micro-soldering diagnostics to restore liquid-damaged devices.",
    longDescription:
      "Water and liquid damage is a race against electro-chemical oxidation. When moisture meets live electrical currents on a logic board, minerals corrode copper traces, bridge capacitor pins, and cause destructive short circuits. FixUrDevice operates a specialized repair lab in Bangalore equipped with ultrasonic chemical wash tanks, AmScope stereo microscopes, and thermal imaging cameras to locate and repair corroded micro-soldered circuits.",
    turnaround: "24 to 48 Hours (Thorough Diagnostic)",
    partQuality: "Micro-Soldering & Component-Level Recovery",
    symptoms: [
      "Phone fell in water, sink, rain, pool, or beverage",
      "Device does not turn on, stays stuck on boot logo, or boot loops",
      "Moisture detected warning in charging port that won't go away",
      "Display backlight dead or showing fuzzy discolored artifacts",
      "Device heats up excessively as soon as charging cable is inserted",
    ],
    processSteps: [
      {
        step: 1,
        title: "Immediate Emergency Power Disconnect",
        desc: "We immediately disconnect the battery to halt active galvanic corrosion that degrades logic board traces when powered.",
      },
      {
        step: 2,
        title: "Ultrasonic Chemical De-Oxidation Wash",
        desc: "Motherboard RF shields are desoldered and the board is submerged in an ultrasonic bath with specialized electronic flux-stripping solvents.",
      },
      {
        step: 3,
        title: "Microscope & Thermal Short-Circuit Tracing",
        desc: "Using thermal imaging and multi-meter diode mode checks under high-magnification microscopes, we identify shorted ceramic capacitors and blown power management ICs.",
      },
      {
        step: 4,
        title: "SMD Component Replacement & Comprehensive Testing",
        desc: "Corroded micro-components are reworked with precision soldering stations, followed by full boot testing, data recovery verification, and sensor validation.",
      },
    ],
    features: [
      "Industrial ultrasonic chemical bath removes deep corrosion",
      "Thermal camera short-circuit tracing for pinpoint IC diagnostics",
      "Component-level micro-soldering (save your expensive motherboard)",
      "High priority given to personal photos and data preservation",
      "Clear diagnosis and zero repair fee if your device is unrecoverable",
    ],
    whatsIncluded: [
      "Urgent doorstep collection across Bangalore",
      "Full motherboard teardown, shield removal, and chemical cleaning",
      "Detailed microscope diagnostic report and quotation",
      "Micro-soldering repair upon your formal approval",
      "Comprehensive multi-function test before device return",
    ],
    suitableFor: [
      "All Apple iPhones, iPads, and MacBooks",
      "Samsung Galaxy flagship and mid-range devices",
      "OnePlus, Pixel, Xiaomi, Vivo, and Oppo phones",
    ],
    faq: [
      {
        q: "Should I put my wet phone in raw rice?",
        a: "No! Rice does not absorb internal moisture and introduces starch and dust that cakes onto wet logic circuits, accelerating corrosion. Turn the device off and have it professionally opened immediately.",
      },
      {
        q: "Can my photos and data be saved from a dead water-damaged phone?",
        a: "In the majority of cases, yes! Even if screens or batteries are destroyed, our micro-soldering team can stabilize the power rails and CPU/NAND memory to rescue all personal data.",
      },
      {
        q: "What if the device cannot be saved?",
        a: "If the motherboard CPU or NAND memory is irreversibly oxidized, we provide an honest report and return the device. We only proceed with billing upon clear agreed terms.",
      },
    ],
  },

  "charging-port-repair": {
    title: "Charging Port Repair in Bangalore",
    badge: "Fast Turnaround",
    image: "/images/services/charging-port-repair.jpg",
    description:
      "Loose cable connection, slow charging, or unrecognised Lightning/USB-C connector? We provide ultrasonic port cleaning, pin realignment, and full dock flex replacement.",
    longDescription:
      "A failing charging port is one of the most frustrating phone issues. Often caused by compacted pocket lint, bent metallic pins, or oxidization from moisture, charging port issues can cause slow charging, intermittent disconnections, or prevent the phone from taking any power at all. FixUrDevice provides microscopic port cleaning, pin micro-soldering, and complete OEM dock assembly replacements.",
    turnaround: "1 to 3 Hours (Same Day)",
    partQuality: "OEM Dock Assembly & Micro-Soldered Ports",
    symptoms: [
      "Charging cable falls out easily or doesn't click into place",
      "Must wiggle cable or hold it at an angle to charge",
      "Device charges very slowly or shows 'Slow Charging' warning",
      "Computer does not recognize phone via USB data transfer",
      "Headphones or USB-C audio accessories not detected",
    ],
    processSteps: [
      {
        step: 1,
        title: "Microscope Debris & Pin Inspection",
        desc: "We inspect the interior pins under a stereo microscope to determine if the issue is compacted lint or physical pin fracture.",
      },
      {
        step: 2,
        title: "Non-Conductive Ultrasonic De-linting",
        desc: "If pins are intact, we safely clear compacted debris and carbon oxidization without scratching internal gold contacts.",
      },
      {
        step: 3,
        title: "Dock Flex or Sub-Board Replacement",
        desc: "If connector pins are bent or broken, we replace the entire sub-board dock flex including microphone and antenna connections.",
      },
      {
        step: 4,
        title: "Fast Charge (PD/PPS) & Data Sync Verification",
        desc: "We verify USB Power Delivery high-amperage charging, fast charge protocols, and data transfer with a host computer.",
      },
    ],
    features: [
      "Lightning, USB Type-C, and legacy Micro-USB supported",
      "Microphone and cellular antenna grounding checked during assembly",
      "Preserves USB-PD, Dash/Warp, and SuperVOOC fast charging speeds",
      "Doorstep pickup & fast turnaround across Bangalore",
    ],
    whatsIncluded: [
      "Diagnostic check of port, cable, and charging IC",
      "Microscopic cleaning or dock flex replacement",
      "Fast charging and data sync verification",
      "Doorstep return to your location in Bangalore",
    ],
    suitableFor: [
      "Apple iPhone 15 series (USB-C) & iPhone 14/13/12/11/X (Lightning)",
      "Samsung Galaxy S24, S23, S22, A-Series, Note Series",
      "OnePlus, Pixel, Xiaomi, Realme, Motorola, and Vivo phones",
    ],
    faq: [
      {
        q: "Could my charging problem just be dirt in the port?",
        a: "Yes! In nearly 40% of cases, compacted lint prevents the cable from making full contact. We always inspect this first and never charge you for a part replacement if simple micro-cleaning resolves the issue.",
      },
      {
        q: "Will fast charging (USB-PD or Warp/VOOC) work after repair?",
        a: "Yes. We use original specification dock flex units that feature the correct trace width to support high-wattage fast charging safely.",
      },
    ],
  },

  "iphone-screen-replacement": {
    title: "Specialized Apple iPhone Repair in Bangalore",
    badge: "Apple Hardware Specialists",
    image: "/images/services/iphone-repair.jpg",
    description:
      "Bangalore's dedicated independent Apple repair service. iPhone screen, battery, TrueDepth Face ID, camera, rear housing glass, and logic board micro-soldering.",
    longDescription:
      "FixUrDevice specializes in hardware engineering for the entire Apple iPhone ecosystem. From the latest iPhone 15 Pro Max down to classic models, our technicians are trained on Apple internal architecture, proprietary Pentalobe screw standards, flex cable routings, and logic board micro-soldering. With doorstep pickup and return across Bangalore, you receive lab-grade Apple repairs without the steep service center pricing.",
    turnaround: "Same Day or 24 Hours",
    partQuality: "OEM Apple-Grade Components & Precision Tools",
    symptoms: [
      "Cracked iPhone front glass or OLED touch failure",
      "Degraded battery requiring frequent charging or service notification",
      "Shattered back glass housing or dented aluminum/titanium frame",
      "Face ID failure stating 'Move iPhone higher / lower' or TrueDepth error",
      "Rear camera shaking, blurry, or showing dark spots",
      "iPhone stuck on Apple logo boot loop or Error 4013",
    ],
    processSteps: [
      {
        step: 1,
        title: "Apple Diagnostic Hardware Assessment",
        desc: "We perform hardware intake diagnostics verifying TrueDepth sensors, True Tone display EEPROM data, ambient sensors, and battery cycle counts.",
      },
      {
        step: 2,
        title: "Precision Lab Teardown & Isolation",
        desc: "Opening using specialized vacuum suction and thermal heating ensures zero frame stress. Internal screw brackets are tracked in magnetic project trays.",
      },
      {
        step: 3,
        title: "Component Calibration & Data Programming",
        desc: "We use professional EEPROM programmers to migrate display calibration, battery health profiles, and Face ID flex alignment.",
      },
      {
        step: 4,
        title: "Perimeter Water-Seal & 24-Point Verification",
        desc: "A fresh Apple-spec adhesive seal is pressed into place. We test Apple Pay NFC, wireless charging, earpiece stereo acoustics, and cameras.",
      },
    ],
    features: [
      "Covers iPhone 15, 14, 13, 12, 11, XS, XR, X, 8, SE series",
      "Preserves Apple True Tone display data and auto-brightness",
      "Laser back glass removal for cracked rear housings",
      "Specialized Face ID TrueDepth dot projector calibration",
      "Transparent diagnostic and clear quotation before work begins",
    ],
    whatsIncluded: [
      "Doorstep pickup anywhere in Bangalore",
      "Complete Apple hardware diagnostic check",
      "Genuine-grade component installation upon your approval",
      "Full True Tone and sensor functionality test",
      "Insured return delivery to your home or office",
    ],
    suitableFor: [
      "iPhone 15, 15 Plus, 15 Pro, 15 Pro Max",
      "iPhone 14, 14 Plus, 14 Pro, 14 Pro Max",
      "iPhone 13, 13 mini, 13 Pro, 13 Pro Max",
      "iPhone 12, 12 mini, 12 Pro, 12 Pro Max",
      "iPhone 11, 11 Pro, 11 Pro Max, SE 2nd & 3rd Gen",
      "iPhone X, XS, XS Max, XR, 8, 8 Plus",
    ],
    faq: [
      {
        q: "Will True Tone and Face ID continue to work after a screen replacement?",
        a: "Yes. Our lab uses proprietary programmers to transfer original display serial numbers to the new panel, preserving True Tone and Face ID functionality.",
      },
      {
        q: "Can you replace just the back glass without replacing the entire expensive housing?",
        a: "Yes! We use precision laser back glass removal technology to remove shattered rear glass and install fresh OEM glass, saving you up to 60% compared to full housing replacements.",
      },
      {
        q: "What is your turnaround time for iPhone repairs?",
        a: "Most iPhone screen, battery, and camera replacements are completed within 4 to 8 hours on the same day.",
      },
    ],
  },

  "camera-repair": {
    title: "Camera & Lens Repair in Bangalore",
    badge: "Optical Precision Service",
    image: "/images/services/camera-repair.jpg",
    description:
      "Blurry focus, cracked sapphire outer lens, black camera screen, or vibrating optical image stabilization? We replace front and rear camera modules with genuine components.",
    longDescription:
      "Modern smartphone cameras are complex optical machines featuring multi-element lenses, magnetic voice-coil motor (VCM) autofocus, and optical image stabilization (OIS). Motorcycle vibrations or accidental drops can fracture the delicate stabilizing springs or crack the external sapphire lens. FixUrDevice provides precision lens replacement and complete camera module restoration in Bangalore.",
    turnaround: "Same Day (2 to 6 Hours)",
    partQuality: "Genuine Optical Sensors & Sapphire Crystal Lenses",
    symptoms: [
      "Camera viewfinder is completely black or crashes the camera app",
      "Image vibrates wildly or produces buzzing/clicking sounds (broken OIS)",
      "Photos appear blurry, hazy, or fail to focus on close/distant subjects",
      "Dark spots, purple blotches, or laser burns visible in photos",
      "Outer sapphire glass lens is cracked, allowing dust inside the sensor",
    ],
    processSteps: [
      {
        step: 1,
        title: "Optical Sensor & Lens Analysis",
        desc: "We diagnose whether the issue is isolated to cracked external glass or damaged internal OIS gyro coils.",
      },
      {
        step: 2,
        title: "Clean-Room Dust Extraction",
        desc: "Outer lens replacement is performed under laminar dust-free benches so no microscopic lint settles onto the bare image sensor.",
      },
      {
        step: 3,
        title: "Camera Module Swapping & Calibration",
        desc: "When modules have broken sensors or fractured actuators, we replace the entire triple/dual module with an OEM-calibrated unit.",
      },
      {
        step: 4,
        title: "Optical Focus & Video Stabilization Testing",
        desc: "We verify wide-angle, ultra-wide, telephoto, 4K/60fps video, and portrait mode depth mapping.",
      },
    ],
    features: [
      "Sapphire crystal outer lens replacement without opening the whole phone",
      "Front TrueDepth/selfie camera and rear multi-lens replacements",
      "Restores crystal-clear 4K video and optical stabilization",
      "Preserves cinematic mode and portrait depth sensors",
      "Doorstep pickup and delivery in Bangalore",
    ],
    whatsIncluded: [
      "Optical hardware diagnostic",
      "Clean-room dust removal and lens or module replacement",
      "Multi-focal length optical focus testing",
      "Delivery back to your address in Bangalore",
    ],
    suitableFor: [
      "Apple iPhone 15/14/13/12/11 Pro Max & Pro Models",
      "Samsung Galaxy S24 Ultra, S23 Ultra, S22 Ultra (100x zoom modules)",
      "Google Pixel 8 Pro, 7 Pro, 6 Pro",
      "OnePlus Hasselblad multi-camera devices",
    ],
    faq: [
      {
        q: "Why does my camera buzz and vibrate when I open the app?",
        a: "This happens when the tiny magnets controlling Optical Image Stabilization (OIS) break—very common after mounting phones on motorcycle handlebars. Replacing the camera module completely fixes this.",
      },
      {
        q: "My outer glass is cracked, but the camera still works. Should I wait?",
        a: "No! A cracked lens allows dust and moisture to permanently scratch the sensitive camera sensor beneath. Replacing the inexpensive outer glass immediately saves you from buying a costly camera module later.",
      },
    ],
  },

  "speaker-microphone-repair": {
    title: "Speaker, Earpiece & Microphone Repair in Bangalore",
    badge: "Acoustic Audio Lab",
    image: "/images/services/speaker-repair.jpg",
    description:
      "Can't hear callers during phone calls, low earpiece sound, crackling audio, or callers can't hear you? We clean acoustic dust mesh and replace audio drivers.",
    longDescription:
      "Acoustic components in smartphones are exposed directly to the outside environment. Over months of use, earwax, makeup, oil, and atmospheric dust clog the ultra-fine acoustic mesh. In other cases, blown voice coils or water exposure cause distortion or complete audio failure. FixUrDevice provides ultrasonic mesh decontamination, loudspeaker driver replacement, and audio codec IC micro-soldering.",
    turnaround: "1 to 4 Hours (Same Day)",
    partQuality: "OEM Acoustic Modules & Precision Dust Filters",
    symptoms: [
      "Earpiece volume is extremely quiet even when turned up to 100%",
      "Loudspeaker crackles, distorts, or produces muffled tinny audio",
      "Callers say they cannot hear you or your voice is robotic/muffled",
      "No sound on video recordings or Siri/Google Assistant cannot hear voice",
      "iPhone ear speaker completely silent during regular cellular calls",
    ],
    processSteps: [
      {
        step: 1,
        title: "Acoustic Mesh Inspection & Frequency Sweep",
        desc: "We run high and low frequency acoustic sweeps to detect harmonic distortion and check mesh airflow impedance.",
      },
      {
        step: 2,
        title: "Ultrasonic Chemical Decontamination",
        desc: "In many cases, gentle chemical dissolution and vacuum extraction removes compacted earwax and dust from the fine grill without teardown.",
      },
      {
        step: 3,
        title: "Loudspeaker or Earpiece Flex Replacement",
        desc: "If voice coils are blown or torn, we replace the acoustic driver module with an OEM-spec replacement.",
      },
      {
        step: 4,
        title: "Dual-Microphone Noise Cancellation Validation",
        desc: "We test primary call microphones, secondary noise-cancellation microphones, and stereo audio playback.",
      },
    ],
    features: [
      "Earpiece receiver, bottom loudspeaker, and microphone arrays serviced",
      "Non-invasive ultrasonic acoustic grill cleaning",
      "Restores loud, crisp voice clarity for phone and WhatsApp calls",
      "Tested with cellular calls and noise-cancellation scenarios",
    ],
    whatsIncluded: [
      "Acoustic sound and microphone diagnostic",
      "Grill cleaning or driver module replacement upon approval",
      "Full stereo playback and voice call test",
      "Doorstep delivery across Bangalore",
    ],
    suitableFor: [
      "All Apple iPhones, Samsung Galaxy phones, OnePlus, Pixel, and Xiaomi",
    ],
    faq: [
      {
        q: "My iPhone earpiece is very faint. Does it definitely need a new part?",
        a: "Not necessarily! In about 65% of cases, microscopic dust and skin oils clog the dense protective screen mesh. Our professional cleaning clears the blockage and restores 100% volume without replacing any parts.",
      },
      {
        q: "People can't hear me unless I put my phone on speaker. What is wrong?",
        a: "Smartphones use different microphones for regular calls vs speakerphone. This indicates your primary lower microphone is damaged or blocked. We can diagnose and fix this quickly.",
      },
    ],
  },

  "biometric-repair": {
    title: "Face ID, Touch ID & Motherboard Repair in Bangalore",
    badge: "Level-3 Micro-Soldering Lab",
    image: "/images/services/biometric-repair.jpg",
    description:
      "Face ID 'Move iPhone higher/lower' error, Touch ID home button failure, short circuits, or dead logic board? Our certified engineers perform chip-level micro-soldering.",
    longDescription:
      "Apple Face ID and biometric security sensors are cryptographically tied to the device's Secure Enclave processor. Damage to the TrueDepth dot projector flex, flood illuminator, or power IC will disable Face ID completely. While standard shops tell customers 'Face ID cannot be repaired', FixUrDevice operates a Level-3 micro-soldering lab equipped with optical dot projector programmers, desoldering stations, and micro-jumpers to restore Face ID hardware without losing cryptographic pairing.",
    turnaround: "24 to 48 Hours",
    partQuality: "Level-3 Micro-Soldering & Cryptographic Preservation",
    symptoms: [
      "Face ID displays 'A problem was detected with TrueDepth camera'",
      "Face ID setup screen asks to 'Move iPhone a little lower / higher' indefinitely",
      "Touch ID fingerprint sensor greyed out or button does not click",
      "Device does not power on after impact drop or power surge",
      "Motherboard short circuit causing extreme heating and zero battery life",
      "iPhone stuck in recovery mode or Error 4013 / Error 9 on iTunes",
    ],
    processSteps: [
      {
        step: 1,
        title: "Dot Projector & Infrared Sensor Diagnostics",
        desc: "Using specialized Face ID hardware analyzers, we read internal fuse values, I2C data lines, and infrared diode continuity.",
      },
      {
        step: 2,
        title: "Microscope Prism Re-alignment & Flex Splicing",
        desc: "Under 40x magnification, we desolder the damaged dot projector chip from the flex cable and splice it onto a reinforced programmed bridge flex.",
      },
      {
        step: 3,
        title: "Chip-Level Logic Board Micro-Soldering",
        desc: "For motherboard power issues, we separate sandwich logic boards, reball BGA chips, and replace shorted capacitors and power management ICs.",
      },
      {
        step: 4,
        title: "Secure Enclave & Biometric Registration Verification",
        desc: "The device is booted and tested for rapid, reliable 3D facial recognition, Apple Pay authentication, and thermal stability.",
      },
    ],
    features: [
      "TrueDepth dot projector micro-soldering and alignment",
      "Preserves original Secure Enclave cryptographic pairing",
      "Sandwich motherboard desoldering and reballing for iPhone X to 15 series",
      "Restores Face ID even after liquid damage or impact cracks",
      "Bangalore's dedicated chip-level independent repair lab",
    ],
    whatsIncluded: [
      "Pickup from your address in Bangalore",
      "Detailed microscope diagnostic and component report",
      "Precision Level-3 micro-soldering upon your approval",
      "Biometric enrollment and Apple Pay validation",
      "Delivery back to your doorstep",
    ],
    suitableFor: [
      "Apple iPhone X, XR, XS, XS Max, 11, 11 Pro, 11 Pro Max",
      "Apple iPhone 12, 13, 14, 15 Pro & Pro Max Series",
      "Apple iPads with Face ID or Touch ID",
      "Samsung and Android in-display fingerprint sensor modules",
    ],
    faq: [
      {
        q: "Apple said my Face ID cannot be repaired without replacing the whole phone. Can you fix it?",
        a: "Yes! Apple does not perform component-level micro-soldering in retail stores. Our lab replaces the damaged dot projector diode and reprogram the original encryption data, restoring Face ID at a fraction of the cost.",
      },
      {
        q: "Will my data be safe during motherboard micro-soldering?",
        a: "Yes. Our main objective during logic board repairs is to restore the power rails so the processor and flash memory boot normally, keeping 100% of your photos and data intact.",
      },
    ],
  },
};

// Map aliases for seamless navigation
serviceData["iphone-repair"] = serviceData["iphone-screen-replacement"];
serviceData["speaker-repair"] = serviceData["speaker-microphone-repair"];

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(serviceData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceData[slug];
  if (!service) {
    return { title: "Service Not Found — FixUrDevice Bangalore" };
  }
  return {
    title: `${service.title} | FixUrDevice Bangalore`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = serviceData[slug];

  if (!service) {
    return (
      <>
        <Header />
        <main style={{ padding: "6rem 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--brand-lavender)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <AlertCircle size={32} color="var(--brand-purple)" />
            </div>
            <h1 className="display-2" style={{ marginBottom: "1rem" }}>
              Service Not Found
            </h1>
            <p style={{ color: "var(--gray-500)", marginBottom: "2rem", lineHeight: 1.6 }}>
              The specific repair service you requested could not be located. Browse all our workshop services or contact our team directly for a custom diagnosis.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/services" className="btn btn-primary">
                Explore All Services <ArrowRight size={16} />
              </Link>
              <Link href="/" className="btn btn-secondary">
                Return to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION */}
        <section
          style={{
            background: "var(--gradient-hero)",
            padding: "4.5rem 0 4rem",
            position: "relative",
            borderBottom: "1px solid rgba(108, 63, 255, 0.12)",
          }}
        >
          <div className="container">
            {/* Breadcrumbs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                fontSize: "0.85rem",
                color: "var(--gray-500)",
              }}
            >
              <Link href="/" style={{ color: "var(--gray-500)", textDecoration: "none" }}>
                Home
              </Link>
              <span>/</span>
              <Link href="/services" style={{ color: "var(--gray-500)", textDecoration: "none" }}>
                Services
              </Link>
              <span>/</span>
              <span style={{ color: "var(--brand-purple)", fontWeight: 600 }}>
                {service.title.split(" in ")[0]}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: "3.5rem",
                alignItems: "center",
              }}
              className="hero-grid"
            >
              {/* Left Column: Information & CTAs */}
              <div>
                <div
                  className="section-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <Star size={12} />
                  {service.badge}
                </div>

                <h1
                  className="display-1"
                  style={{
                    color: "var(--brand-navy)",
                    marginBottom: "1.25rem",
                    lineHeight: 1.15,
                  }}
                >
                  {service.title}
                </h1>

                <p
                  style={{
                    color: "var(--gray-600)",
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    marginBottom: "1.75rem",
                  }}
                >
                  {service.description}
                </p>

                {/* Key specs highlight */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "2rem",
                    padding: "1rem 1.25rem",
                    background: "white",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase" }}>
                      Turnaround
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--brand-navy)", fontSize: "0.95rem" }}>
                      ⚡ {service.turnaround}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase" }}>
                      Component Grade
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--brand-purple)", fontSize: "0.95rem" }}>
                      🛡️ {service.partQuality}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Link
                    href={`/book-repair?service=${slug}`}
                    id="service-hero-book-cta"
                    className="btn btn-primary btn-lg"
                  >
                    Request This Repair
                    <ArrowRight size={18} />
                  </Link>
                  <a
                    href="tel:9343584460"
                    className="btn btn-secondary btn-lg"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Phone size={16} />
                    Call: 93435 84460
                  </a>
                </div>
              </div>

              {/* Right Column: Authentic Workshop Photo Card */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--border-radius-2xl)",
                  overflow: "hidden",
                  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.18)",
                  border: "2px solid white",
                  background: "#0f172a",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "380px",
                  }}
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 550px"
                    style={{
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 50%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "1.25rem",
                      left: "1.25rem",
                      right: "1.25rem",
                      color: "white",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.35rem 0.75rem",
                        background: "rgba(108, 63, 255, 0.9)",
                        borderRadius: "var(--border-radius-full)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Wrench size={12} />
                      FixUrDevice Workshop Lab
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                      Precision ESD-Safe Bench Repair in Jayanagar, Bangalore
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER STRIP */}
        <section
          style={{
            background: "white",
            borderBottom: "1px solid var(--border-color)",
            padding: "1.5rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5rem",
              }}
              className="benefits-grid"
            >
              {[
                { icon: Truck, title: "Doorstep Pickup & Return", subtitle: "Across eligible Bangalore areas" },
                { icon: Shield, title: "Clear Quote First", subtitle: "No repair without your approval" },
                { icon: CheckCircle2, title: "OEM-Tested Parts", subtitle: "Strict 24-point hardware QC" },
                { icon: Clock, title: "Prompt Turnaround", subtitle: "Real-time updates via WhatsApp" },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: "var(--brand-lavender)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <item.icon size={20} color="var(--brand-purple)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--brand-navy)" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEEP DIVE SERVICE EXPLANATION & PROCESS */}
        <section className="section" style={{ background: "var(--gray-50)" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 380px",
                gap: "3rem",
                alignItems: "start",
              }}
              className="service-detail-grid"
            >
              {/* Main Detailed Column */}
              <div>
                {/* 1. Deep Overview */}
                <div
                  style={{
                    background: "white",
                    padding: "2.25rem",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    marginBottom: "2rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--brand-navy)" }}>
                    About This Repair Service
                  </h2>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "1rem", marginBottom: "1.5rem" }}>
                    {service.longDescription}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {service.features.map((feat) => (
                      <div
                        key={feat}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "var(--brand-navy)",
                          fontWeight: 500,
                        }}
                      >
                        <Check size={16} color="var(--brand-purple)" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Common Symptoms */}
                <div
                  style={{
                    background: "white",
                    padding: "2.25rem",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    marginBottom: "2rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="section-label" style={{ marginBottom: "0.75rem" }}>
                    <AlertCircle size={12} />
                    Diagnostic Checklist
                  </div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: "1rem", color: "var(--brand-navy)" }}>
                    Common Symptoms You Might Be Experiencing
                  </h2>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    If your device shows any of these indicators, submit a repair enquiry for an immediate inspection:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {service.symptoms.map((symptom) => (
                      <div
                        key={symptom}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.875rem 1rem",
                          background: "#fef2f2",
                          borderRadius: "var(--border-radius)",
                          border: "1px solid #fee2e2",
                          color: "#991b1b",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Step-by-Step Workshop Process */}
                <div
                  style={{
                    background: "white",
                    padding: "2.25rem",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    marginBottom: "2rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="section-label" style={{ marginBottom: "0.75rem" }}>
                    <Wrench size={12} />
                    Lab Workflow
                  </div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--brand-navy)" }}>
                    How We Perform This Repair in Our Bangalore Lab
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {service.processSteps.map((step) => (
                      <div
                        key={step.step}
                        style={{
                          display: "flex",
                          gap: "1.25rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-indigo) 100%)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            flexShrink: 0,
                            boxShadow: "0 4px 10px rgba(108, 63, 255, 0.3)",
                          }}
                        >
                          {step.step}
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.35rem" }}>
                            {step.title}
                          </h3>
                          <p style={{ color: "var(--gray-600)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Supported Models */}
                <div
                  style={{
                    background: "white",
                    padding: "2.25rem",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    marginBottom: "2rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: "1rem", color: "var(--brand-navy)" }}>
                    Supported Devices &amp; Models
                  </h2>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    We service all major smartphone brands. If your model is not listed below, submit an enquiry to confirm:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {service.suitableFor.map((dev) => (
                      <span
                        key={dev}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--brand-lavender)",
                          color: "var(--brand-purple-dark)",
                          borderRadius: "var(--border-radius-full)",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {dev}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. FAQs */}
                <div
                  style={{
                    background: "white",
                    padding: "2.25rem",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="section-label" style={{ marginBottom: "0.75rem" }}>
                    <MessageSquare size={12} />
                    Clear Answers
                  </div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--brand-navy)" }}>
                    Frequently Asked Questions
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {service.faq.map((item) => (
                      <details
                        key={item.q}
                        className="faq-item"
                        style={{
                          background: "var(--gray-50)",
                          borderRadius: "var(--border-radius-lg)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <summary
                          style={{
                            padding: "1rem 1.25rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            listStyle: "none",
                            color: "var(--brand-navy)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {item.q}
                        </summary>
                        <div
                          style={{
                            padding: "0 1.25rem 1.25rem",
                            color: "var(--gray-600)",
                            fontSize: "0.9rem",
                            lineHeight: 1.7,
                          }}
                        >
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div
                style={{
                  position: "sticky",
                  top: "90px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Book Action Card */}
                <div
                  style={{
                    background: "var(--gradient-purple)",
                    borderRadius: "var(--border-radius-xl)",
                    padding: "2.25rem 1.75rem",
                    color: "white",
                    boxShadow: "var(--shadow-purple)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.65rem",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "var(--border-radius-full)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginBottom: "0.75rem",
                    }}
                  >
                    DOORSTEP SERVICE
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    Book Your Repair Assessment
                  </h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.9, lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    Tell us your device model and address. We pick up, diagnose thoroughly, and send you a transparent quote before any work starts.
                  </p>
                  <Link
                    href={`/book-repair?service=${slug}`}
                    id="sidebar-book-repair-cta"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.875rem 1.25rem",
                      background: "white",
                      color: "var(--brand-purple)",
                      borderRadius: "var(--border-radius-full)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    }}
                  >
                    Request Pickup &amp; Quote
                    <ArrowRight size={16} />
                  </Link>

                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <a
                      href="https://wa.me/919343584460?text=Hi%20FixUrDevice%2C%20I%20need%20a%20quote%20for%20repair"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "white",
                        fontSize: "0.85rem",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      💬 Or chat with us on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Direct Hotline Card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    padding: "1.5rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.25rem" }}>
                    Direct Repair Hotline
                  </div>
                  <a
                    href="tel:9343584460"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--brand-purple)",
                      textDecoration: "none",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Phone size={18} />
                    93435 84460
                  </a>
                  <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", lineHeight: 1.5 }}>
                    Available Monday to Saturday, 9:00 AM – 8:00 PM for instant technical consultation.
                  </p>
                </div>

                {/* Physical Store Location Card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    padding: "1.5rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <MapPin size={18} color="var(--brand-purple)" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--brand-navy)" }}>
                      Service Lab in Bangalore
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                    <strong>FixurDevice Apple Service</strong>
                    <br />
                    #159, 1st Floor 32nd E Cross Rd, Opp To Sanjay Gandhi Hospital, 4th T Block East, Tilak Nagar, Jayanagar, Bengaluru 560041
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Fixblr/@12.9276467,77.5911674,17z"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--brand-purple)",
                      textDecoration: "none",
                    }}
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
