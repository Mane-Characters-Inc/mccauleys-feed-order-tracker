/* @ds-bundle: {"format":3,"namespace":"ManeCharactersDesignSystem_019e1d","components":[],"sourceHashes":{"ui_kits/website/App.jsx":"a622295527f9","ui_kits/website/Button.jsx":"fee61160a3a0","ui_kits/website/Footer.jsx":"7d643452ee4f","ui_kits/website/Header.jsx":"3b4a459e8d88","ui_kits/website/HorseCard.jsx":"2c59dd24c31d","ui_kits/website/Icon.jsx":"30424379da42","ui_kits/website/StatusBadge.jsx":"4ad8c5cfe218","ui_kits/website/data.jsx":"50ca9622a4f2","ui_kits/website/screens/About.jsx":"419ef9c70e42","ui_kits/website/screens/Home.jsx":"1e4be0b589d5","ui_kits/website/screens/HorseProfile.jsx":"efb0900e2e15","ui_kits/website/screens/OurCast.jsx":"a80cb6586b21"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ManeCharactersDesignSystem_019e1d = window.ManeCharactersDesignSystem_019e1d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/website/App.jsx
try { (() => {
/* App shell: tracks current screen + selected horse, renders header/footer/content */

const {
  useState: useStateApp
} = React;
const App = () => {
  const [screen, setScreen] = useStateApp('home');
  const [selectedHorse, setSelectedHorse] = useStateApp(null);
  const onNav = id => {
    setScreen(id);
    setSelectedHorse(null);
    window.scrollTo({
      top: 0
    });
  };
  const onOpenHorse = horse => {
    // accept either a full horse object or a {id} stub from the home page
    const full = window.HORSES.find(h => h.id === horse.id) || horse;
    setSelectedHorse(full);
    setScreen('profile');
    window.scrollTo({
      top: 0
    });
  };

  // Map screen → active nav item (for highlighting)
  const navActive = screen === 'profile' ? 'cast' : screen === 'eternal' ? 'eternal' : screen === 'about' ? 'about' : screen === 'involved' ? 'involved' : screen === 'cast' ? 'cast' : screen === 'shop' ? 'shop' : screen === 'contact' ? 'contact' : '';
  let content;
  if (screen === 'home') content = /*#__PURE__*/React.createElement(HomeScreen, {
    onNav: onNav,
    onOpenHorse: onOpenHorse
  });else if (screen === 'cast') content = /*#__PURE__*/React.createElement(OurCastScreen, {
    onOpenHorse: onOpenHorse
  });else if (screen === 'about') content = /*#__PURE__*/React.createElement(AboutScreen, {
    onNav: onNav
  });else if (screen === 'profile' && selectedHorse) content = /*#__PURE__*/React.createElement(HorseProfileScreen, {
    horse: selectedHorse,
    onOpenHorse: onOpenHorse,
    onNav: onNav
  });else content = /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container center",
    style: {
      padding: '80px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Coming soon"), /*#__PURE__*/React.createElement("h2", {
    className: "mc-h2",
    style: {
      margin: '12px 0 16px'
    }
  }, "This screen isn't in the kit yet."), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      maxWidth: '50ch',
      margin: '0 auto 24px'
    }
  }, "The kit currently includes Home, Our Cast, Horse Profile, and About. Let us know which screen you'd like next."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leadingArrow: true,
    onClick: () => onNav('home')
  }, "Back to home")));
  const screens = [['home', 'Home'], ['cast', 'Our Cast'], ['profile', 'Profile'], ['about', 'About']];
  return /*#__PURE__*/React.createElement("div", {
    className: "app-root"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-switcher",
    "data-screen-label": "kit-switcher"
  }, screens.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: screen === id ? 'active' : '',
    onClick: () => {
      if (id === 'profile') {
        onOpenHorse(window.HORSES.find(h => h.id === 'spirit-seeker'));
      } else {
        onNav(id);
      }
    }
  }, label))), /*#__PURE__*/React.createElement(Header, {
    active: navActive,
    onNav: onNav
  }), /*#__PURE__*/React.createElement("main", {
    className: "app-content",
    "data-screen-label": `${screen} screen`
  }, content), /*#__PURE__*/React.createElement(Footer, {
    onNav: onNav
  }));
};
window.App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* BUTTON — all brand variants. variant: primary | secondary | teal | ghost.
   leadingArrow: prepends the right-arrow used on the live Donate CTA. */

const Button = ({
  variant = 'primary',
  size,
  leadingArrow,
  children,
  onClick,
  ...rest
}) => {
  const cls = ['btn', `btn-${variant}`, size === 'lg' && 'btn-lg'].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    onClick: onClick
  }, rest), leadingArrow && /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 14
  }), children);
};
window.Button = Button;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Button.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
/* FOOTER — deep purple upper (per recommendation #5) + purple bottom band.
   4-column upper grid, legal bottom strip. */

const Footer = ({
  onNav
}) => /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("div", {
  className: "footer-top"
}, /*#__PURE__*/React.createElement("div", {
  className: "container footer-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "logo"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logos/round-black.png",
  alt: "Mane Characters"
})), /*#__PURE__*/React.createElement("p", {
  className: "mission"
}, "Mane Characters is a 501(c)(3) nonprofit equine rescue and retirement at Maplehurst Stock Farm in Paris, Kentucky \u2014 the heart of the Bluegrass."), /*#__PURE__*/React.createElement("div", {
  className: "social"
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  "aria-label": "Facebook"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "fb"
})), /*#__PURE__*/React.createElement("a", {
  href: "#",
  "aria-label": "Instagram"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "ig"
})), /*#__PURE__*/React.createElement("a", {
  href: "#",
  "aria-label": "X"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "x"
})), /*#__PURE__*/React.createElement("a", {
  href: "#",
  "aria-label": "YouTube"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "yt"
})), /*#__PURE__*/React.createElement("a", {
  href: "#",
  "aria-label": "TikTok"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "tt"
})), /*#__PURE__*/React.createElement("a", {
  href: "#",
  "aria-label": "LinkedIn"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "li"
})))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Programs"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Rescue"), /*#__PURE__*/React.createElement("li", null, "Rehabilitation"), /*#__PURE__*/React.createElement("li", null, "Re-Training"), /*#__PURE__*/React.createElement("li", null, "Re-Homing"), /*#__PURE__*/React.createElement("li", null, "Retirement"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Quick Links"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => {
    e.preventDefault();
    onNav('about');
  }
}, "About Us")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => {
    e.preventDefault();
    onNav('involved');
  }
}, "Get Involved")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Shop")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Contact")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Privacy Policy")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Get In Touch"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "985 Millersburg Rd", /*#__PURE__*/React.createElement("br", null), "Paris, KY 40361"), /*#__PURE__*/React.createElement("li", null, "info@manecharacters.org"), /*#__PURE__*/React.createElement("li", null, "859-414-6161"), /*#__PURE__*/React.createElement("li", null, "Sun\u2013Sat \xB7 9:00 AM \u2013 5:00 PM"))))), /*#__PURE__*/React.createElement("div", {
  className: "footer-bottom"
}, /*#__PURE__*/React.createElement("div", {
  className: "container"
}, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Mane Characters, Inc. All Rights Reserved."), /*#__PURE__*/React.createElement("span", {
  className: "legal"
}, "Mane Characters, Inc. (D/B/A \"Mane Characters Equine Reserve & Retirement\"), EIN 93-2962199, is a registered 501(c)(3) nonprofit. Your contributions are tax-deductible to the fullest extent of the law."))));
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
/* HEADER — utility bar (purple per brand rec #1) + white main nav.
   Two-tier structure exactly as documented in the brand guidelines. */

const Header = ({
  active,
  onNav
}) => {
  const links = [{
    id: 'cast',
    label: 'Our Cast'
  }, {
    id: 'eternal',
    label: 'Eternal Characters'
  }, {
    id: 'about',
    label: 'About Us'
  }, {
    id: 'involved',
    label: 'Get Involved'
  }, {
    id: 'shop',
    label: 'Shop'
  }, {
    id: 'contact',
    label: 'Contact'
  }];
  return /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", {
    className: "utility-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone"
  }), " 859-414-6161"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail"
  }), " info@manecharacters.org"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin"
  }), " 985 Millersburg Rd, Paris, KY 40361"), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Facebook"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "fb",
    size: 14
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Instagram"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ig",
    size: 14
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "X"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "YouTube"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "yt",
    size: 14
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "TikTok"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tt",
    size: 14
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "LinkedIn"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "li",
    size: 14
  }))))), /*#__PURE__*/React.createElement("nav", {
    className: "main-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav('home');
    }
  }, /*#__PURE__*/React.createElement("img", {
    className: "logo",
    src: "../../assets/logos/round-black.png",
    alt: "Mane Characters"
  })), /*#__PURE__*/React.createElement("div", {
    className: "links"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.id,
    href: "#",
    className: active === l.id ? 'active' : '',
    onClick: e => {
      e.preventDefault();
      onNav(l.id);
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Sign in"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "login",
    size: 20
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Notifications"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    className: "cart"
  }, "$0.00"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Cart"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cart",
    size: 20
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leadingArrow: true
  }, "Donate")))));
};
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HorseCard.jsx
try { (() => {
/* HORSE CARD — 1:1 grid tile. Photo placeholder bg, dark scrim, name in
   Britannic Bold. Eternal status renders in B&W. Hover scales + scrim deepens. */

const HorseCard = ({
  horse,
  onOpen
}) => {
  const photoClass = `photo photo-${horse.photo || 'bay'}`;
  const isEternal = horse.status === 'eternal';
  return /*#__PURE__*/React.createElement("div", {
    className: `horse-card ${isEternal ? 'eternal' : ''}`,
    onClick: () => onOpen && onOpen(horse)
  }, /*#__PURE__*/React.createElement("div", {
    className: photoClass
  }), /*#__PURE__*/React.createElement("div", {
    className: "scrim"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, horse.name), horse.bloodline && /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, horse.bloodline))));
};
window.HorseCard = HorseCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HorseCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ICONS — Lucide line icons used across the kit.
   1.75px stroke · 24px box · round caps · brand color via currentColor. */

const Icon = ({
  name,
  size = 18,
  ...rest
}) => {
  const paths = {
    phone: /*#__PURE__*/React.createElement("path", {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    }),
    mail: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22,6 12,13 2,6"
    })),
    pin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    login: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "10,17 15,12 10,7"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "15",
      y1: "12",
      x2: "3",
      y2: "12"
    })),
    bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.7 21a2 2 0 0 1-3.4 0"
    })),
    cart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "21",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "20",
      cy: "21",
      r: "1"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"
    })),
    arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12,5 19,12 12,19"
    })),
    arrowLeft: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "12",
      x2: "5",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12,19 5,12 12,5"
    })),
    heart: /*#__PURE__*/React.createElement("path", {
      d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
    }),
    play: /*#__PURE__*/React.createElement("polygon", {
      points: "6,4 20,12 6,20 6,4"
    }),
    fb: /*#__PURE__*/React.createElement("path", {
      d: "M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"
    }),
    ig: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "17.5",
      cy: "6.5",
      r: "0.8",
      fill: "currentColor",
      stroke: "none"
    })),
    x: /*#__PURE__*/React.createElement("path", {
      d: "M18 2h3l-7.5 8.6L22 22h-6.8l-5.3-6.9L3.8 22H.8l8-9.2L0 2h6.9l4.8 6.3L18 2z"
    }),
    yt: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "5",
      width: "20",
      height: "14",
      rx: "3"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "10,8.5 16,12 10,15.5"
    })),
    tt: /*#__PURE__*/React.createElement("path", {
      d: "M19 8.2a5.6 5.6 0 0 1-3.5-1.2v7.6a4.8 4.8 0 1 1-4.8-4.8c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.2-.9-.2a2.3 2.3 0 1 0 2.3 2.3V2h2.5a3.2 3.2 0 0 0 3.4 3z"
    }),
    li: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "11",
      x2: "8",
      y2: "17"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "7",
      x2: "8",
      y2: "7.01"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 17v-4a2 2 0 0 1 4 0v4"
    })),
    chev: /*#__PURE__*/React.createElement("polyline", {
      points: "6,9 12,15 18,9"
    })
  };
  // Brand-mark icons get fill instead of stroke
  const filled = ['fb', 'x', 'tt'];
  const isFilled = filled.includes(name);
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: isFilled ? 'currentColor' : 'none',
    stroke: isFilled ? 'none' : 'currentColor',
    strokeWidth: isFilled ? 0 : 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), paths[name]);
};
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Icon.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/StatusBadge.jsx
try { (() => {
/* STATUS BADGE — wraps the source-of-truth PNGs. Use `status` to pick.
   Sized via the size prop in px (default 132 for profile, 80 for inline). */

const STATUS_MAP = {
  eternal: 'eternal.png',
  rehab: 'in-rehab.png',
  retired: 'retired.png',
  adoptable: 'adoption.png',
  adopted: 'adopted.png'
};
const StatusBadge = ({
  status,
  size = 132,
  style
}) => {
  const file = STATUS_MAP[status];
  if (!file) return null;
  return /*#__PURE__*/React.createElement("img", {
    src: `../../assets/badges/${file}`,
    alt: `${status} status`,
    width: size,
    height: size,
    style: style
  });
};
window.StatusBadge = StatusBadge;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/data.jsx
try { (() => {
/* Shared horse data for the kit. Names + bloodlines are sample/voice-matched,
   not factual — the kit is a UI recreation, not a content recreation. */

const HORSES = [{
  id: 'spirit-seeker',
  name: 'Spirit Seeker',
  bloodline: 'Storm Cat × Quiet Heart',
  status: 'rehab',
  photo: 'bay',
  breed: 'Thoroughbred',
  age: 9,
  sex: 'Gelding'
}, {
  id: 'maple',
  name: 'Maple',
  bloodline: 'Pleasant Tap × Sugarcoat',
  status: 'retired',
  photo: 'chestnut',
  breed: 'Thoroughbred',
  age: 24,
  sex: 'Mare'
}, {
  id: 'biscuit',
  name: 'Biscuit',
  bloodline: 'Distorted Humor × Honey',
  status: 'adoptable',
  photo: 'palomino',
  breed: 'Quarter Horse',
  age: 12,
  sex: 'Gelding'
}, {
  id: 'rumour',
  name: 'Rumour',
  bloodline: 'Stay the Night × Whisper',
  status: 'rehab',
  photo: 'grey',
  breed: 'Standardbred',
  age: 7,
  sex: 'Mare'
}, {
  id: 'kentucky-blue',
  name: 'Kentucky Blue',
  bloodline: 'Bluegrass Lad × Daisy',
  status: 'retired',
  photo: 'roan',
  breed: 'Thoroughbred',
  age: 28,
  sex: 'Gelding'
}, {
  id: 'pippin',
  name: 'Pippin',
  bloodline: 'Tapit × Patience',
  status: 'adopted',
  photo: 'paint',
  breed: 'Paint',
  age: 11,
  sex: 'Mare'
}, {
  id: 'archie',
  name: 'Archie',
  bloodline: 'unknown',
  status: 'eternal',
  photo: 'black',
  breed: 'Thoroughbred',
  age: 32,
  sex: 'Gelding'
}, {
  id: 'starling',
  name: 'Starling',
  bloodline: 'Curlin × Even Song',
  status: 'adoptable',
  photo: 'grey',
  breed: 'Thoroughbred',
  age: 8,
  sex: 'Mare'
}, {
  id: 'old-cap',
  name: 'Old Cap',
  bloodline: 'unknown',
  status: 'eternal',
  photo: 'bay',
  breed: 'Standardbred',
  age: 30,
  sex: 'Gelding'
}];
const STATUS_LABEL = {
  eternal: 'Eternal Character',
  rehab: 'In Rehab',
  retired: 'Retired',
  adoptable: 'Adoption Available',
  adopted: 'Adopted'
};
window.HORSES = HORSES;
window.STATUS_LABEL = STATUS_LABEL;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/screens/About.jsx
try { (() => {
/* ABOUT SCREEN — story, mission, programs, location */

const AboutScreen = ({
  onNav
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
  className: "purple-band"
}, /*#__PURE__*/React.createElement("div", {
  className: "container"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "About Mane Characters"), /*#__PURE__*/React.createElement("p", null, "A 501(c)(3) nonprofit equine reserve at Maplehurst Stock Farm, Paris, Kentucky \u2014 heart of the Bluegrass.")), /*#__PURE__*/React.createElement(Button, {
  variant: "ghost",
  leadingArrow: true,
  onClick: () => onNav('involved')
}, "Get Involved"))), /*#__PURE__*/React.createElement("section", {
  className: "section"
}, /*#__PURE__*/React.createElement("div", {
  className: "container story-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "photo-stand-in photo-pasture"
}, /*#__PURE__*/React.createElement("div", {
  className: "caption"
}, "Maplehurst, at dusk")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "eyebrow"
}, "Our story"), /*#__PURE__*/React.createElement("h2", null, "Where horses heal."), /*#__PURE__*/React.createElement("p", null, "Mane Characters lives on Maplehurst Stock Farm, in the picturesque beauty of Bourbon County \u2014 right in the center of horse country. Our work runs in five programs, in this order: Rescue. Rehabilitation. Re-Training. Re-Homing. Retirement."), /*#__PURE__*/React.createElement("p", null, "Every horse here has a name and a personality. We share their progress as it comes \u2014 in full sentences, with the facts that earn the feeling. You'll come to know them."), /*#__PURE__*/React.createElement("blockquote", null, "Every horse, a tale to tell. Every tale, a Mane Character.")))), /*#__PURE__*/React.createElement("section", {
  className: "section whisper-teal"
}, /*#__PURE__*/React.createElement("div", {
  className: "container"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-head"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "eyebrow"
}, "Programs"), /*#__PURE__*/React.createElement("h2", {
  className: "mc-h2"
}, "The five pillars."))), /*#__PURE__*/React.createElement("div", {
  className: "programs"
}, [['01', 'Rescue', 'Intake from auction, surrender, and law-enforcement referrals — fast, safe, careful.'], ['02', 'Rehabilitation', 'Veterinary care, nutritional recovery, time. The work that doesn\'t make the highlight reel.'], ['03', 'Re-Training', 'Ground work and saddle work — second-chance fitness for second-chance horses.'], ['04', 'Re-Homing', 'Adoption matching with vetted, supported homes. We stay involved.'], ['05', 'Retirement', 'Pasture, herd, and forever-home stewardship for the horses who stay with us.']].map(([n, h, p]) => /*#__PURE__*/React.createElement("div", {
  key: n,
  className: "program"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, n), /*#__PURE__*/React.createElement("h4", null, h), /*#__PURE__*/React.createElement("p", null, p)))))), /*#__PURE__*/React.createElement("section", {
  className: "section dark"
}, /*#__PURE__*/React.createElement("div", {
  className: "container"
}, /*#__PURE__*/React.createElement("div", {
  className: "stats"
}, /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "2023"), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "Year Founded")), /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "37"), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "Horses In Our Care")), /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "142"), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "Re-Homed Successfully")), /*#__PURE__*/React.createElement("div", {
  className: "stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "100%"), /*#__PURE__*/React.createElement("div", {
  className: "label"
}, "Donations Tax-Deductible"))))));
window.AboutScreen = AboutScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/screens/About.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/screens/Home.jsx
try { (() => {
/* HOME SCREEN */

const HomeScreen = ({
  onNav,
  onOpenHorse
}) => {
  const featured = window.HORSES.filter(h => h.status !== 'eternal').slice(0, 6);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "photo-stand-in"
  }), /*#__PURE__*/React.createElement("div", {
    className: "scrim"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Every horse, a tale to tell"), /*#__PURE__*/React.createElement("h1", {
    className: "title"
  }, "Every tale, a ", /*#__PURE__*/React.createElement("em", null, "Mane Character"), "."), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, "A 501(c)(3) equine reserve at Maplehurst Stock Farm in Paris, Kentucky \u2014 rescue, rehabilitation, re-training, re-homing, and retirement, in that order. Meet the horses you'll come to know by name."), /*#__PURE__*/React.createElement("div", {
    className: "cta-row"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    leadingArrow: true,
    onClick: () => onNav('cast')
  }, "Meet The Cast"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    onClick: () => onNav('involved')
  }, "Sponsor A Horse")))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "What we do"), /*#__PURE__*/React.createElement("h2", {
    className: "mc-h2"
  }, "Five programs. One promise.")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "muted",
    onClick: e => {
      e.preventDefault();
      onNav('about');
    }
  }, "Read about our work \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "programs"
  }, [['01', 'Rescue', 'Intake from auction, surrender, and law-enforcement referrals.'], ['02', 'Rehabilitation', 'Veterinary care, nutritional recovery, and time. Lots of time.'], ['03', 'Re-Training', 'Ground work, saddle work, and second-chance fitness.'], ['04', 'Re-Homing', 'Careful adoption matching with vetted, supported homes.'], ['05', 'Retirement', 'Pasture, herd, and forever-home stewardship.']].map(([n, h, p]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    className: "program"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, n), /*#__PURE__*/React.createElement("h4", null, h), /*#__PURE__*/React.createElement("p", null, p)))))), /*#__PURE__*/React.createElement("section", {
    className: "section whisper-purple"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Our cast"), /*#__PURE__*/React.createElement("h2", {
    className: "mc-h2"
  }, "The horses you'll come to know.")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "muted",
    onClick: e => {
      e.preventDefault();
      onNav('cast');
    }
  }, "Meet them all \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "horse-grid"
  }, featured.map(h => /*#__PURE__*/React.createElement(HorseCard, {
    key: h.id,
    horse: h,
    onOpen: onOpenHorse
  }))))), /*#__PURE__*/React.createElement("section", {
    className: "section dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "37"), /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Horses In Our Care")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "142"), /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Re-Homed Since 2023")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "9"), /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Eternal Characters")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "100%"), /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Tax-Deductible"))))), /*#__PURE__*/React.createElement("section", {
    className: "sponsor-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: '#8CD4CF'
    }
  }, "Pay-what-you-can"), /*#__PURE__*/React.createElement("h2", null, "Sponsor ", /*#__PURE__*/React.createElement("em", null, "Spirit Seeker"), "."), /*#__PURE__*/React.createElement("p", null, "Every sponsor gets the same updates, regardless of contribution. You'll follow Spirit's recovery, vet check-ins, and the small daily moments from the farm."), /*#__PURE__*/React.createElement("div", {
    className: "cta-row"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "teal",
    size: "lg",
    leadingArrow: true,
    onClick: () => onOpenHorse({
      id: 'spirit-seeker'
    })
  }, "Follow Spirit's Journey"))), /*#__PURE__*/React.createElement("div", {
    className: "photo-stand-in photo-bay",
    style: {
      aspectRatio: '4/3',
      borderRadius: 16,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "photo-name"
  }, "Spirit Seeker")))));
};
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/screens/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/screens/HorseProfile.jsx
try { (() => {
/* HORSE PROFILE SCREEN — utility bar + bio card both pick up the status color */

const HorseProfileScreen = ({
  horse,
  onOpenHorse,
  onNav
}) => {
  const allHorses = window.HORSES;
  const idx = allHorses.findIndex(h => h.id === horse.id);
  const prev = allHorses[(idx - 1 + allHorses.length) % allHorses.length];
  const next = allHorses[(idx + 1) % allHorses.length];
  const status = horse.status;
  const isEternal = status === 'eternal';
  // Map status → badge file id (in-rehab vs rehab)
  const badgeFor = status;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: `profile-utility ${status}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-label"
  }, window.STATUS_LABEL[status]), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .8
    }
  }, "Maplehurst Stock Farm \xB7 Paris, KY"), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("span", null, "985 Millersburg Rd \xB7 859-414-6161")))), /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-prev-next"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav",
    onClick: () => onOpenHorse(prev)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowLeft",
    size: 16
  }), /*#__PURE__*/React.createElement("div", {
    className: `thumb photo-${prev.photo || 'bay'}`,
    style: {
      filter: prev.status === 'eternal' ? 'grayscale(1)' : 'none'
    }
  }), /*#__PURE__*/React.createElement("span", null, prev.name)), /*#__PURE__*/React.createElement("div", {
    className: "center"
  }, "Profile ", idx + 1, " of ", allHorses.length), /*#__PURE__*/React.createElement("div", {
    className: "nav",
    onClick: () => onOpenHorse(next)
  }, /*#__PURE__*/React.createElement("span", null, next.name), /*#__PURE__*/React.createElement("div", {
    className: `thumb photo-${next.photo || 'bay'}`,
    style: {
      filter: next.status === 'eternal' ? 'grayscale(1)' : 'none'
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: `profile-hero ${isEternal ? 'eternal' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: `photo photo-${horse.photo || 'bay'}`
  }), /*#__PURE__*/React.createElement(StatusBadge, {
    status: badgeFor,
    size: 132,
    style: {
      position: 'absolute',
      top: 22,
      right: 22,
      filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.35))'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "profile-headline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, /*#__PURE__*/React.createElement("h1", null, horse.name), /*#__PURE__*/React.createElement("div", {
    className: "blood"
  }, horse.bloodline)), !isEternal && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    leadingArrow: true
  }, "Sponsor ", horse.name, " Now!")), /*#__PURE__*/React.createElement("div", {
    className: "profile-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "story"
  }, /*#__PURE__*/React.createElement("h3", null, "My Story"), /*#__PURE__*/React.createElement("p", null, horse.name, " arrived at Maplehurst on a clear Tuesday morning, after a long trailer ride and a longer wait at the auction barn. The first week was quiet \u2014 we let ", horse.name, " settle in, watched, listened, took notes from the vet team. A body condition score that needed work. A coat that needed time."), /*#__PURE__*/React.createElement("p", null, "The progress, when it came, came in small ways. A clean feed bucket. A trot across the paddock. The way ", horse.name, " would lean into a hand at the gate. We're not done \u2014 but we know the shape of this story now, and we wanted to pass that on, to all of you who care."), /*#__PURE__*/React.createElement("blockquote", {
    className: "mc-pull-quote"
  }, "It's a good day. \uD83D\uDCAA")), /*#__PURE__*/React.createElement("aside", null, /*#__PURE__*/React.createElement("div", {
    className: `bio-card ${status}`
  }, /*#__PURE__*/React.createElement("h4", null, "Bio"), /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement("dt", null, "Breed"), /*#__PURE__*/React.createElement("dd", null, horse.breed), /*#__PURE__*/React.createElement("dt", null, "Sex"), /*#__PURE__*/React.createElement("dd", null, horse.sex), /*#__PURE__*/React.createElement("dt", null, "Age"), /*#__PURE__*/React.createElement("dd", null, horse.age, " yrs"), /*#__PURE__*/React.createElement("dt", null, "State Bred"), /*#__PURE__*/React.createElement("dd", null, "Kentucky"), /*#__PURE__*/React.createElement("dt", null, "Foaling Date"), /*#__PURE__*/React.createElement("dd", null, "April 12, ", 2026 - horse.age), /*#__PURE__*/React.createElement("dt", null, "Favorite Treat"), /*#__PURE__*/React.createElement("dd", null, "Carrots, sliced"), /*#__PURE__*/React.createElement("dt", null, "Fun Fact"), /*#__PURE__*/React.createElement("dd", null, "Knows their name. Comes when called."))))), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#69428A',
      margin: '8px 0 12px',
      fontWeight: 600
    }
  }, "Photos & video"), /*#__PURE__*/React.createElement("div", {
    className: "gallery"
  }, ['photo-chestnut', 'photo-bay', 'photo-pasture', 'photo-grey'].map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `tile ${c}`,
    style: {
      filter: isEternal ? 'grayscale(1)' : 'none'
    }
  }))), !isEternal && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#69428A',
      color: '#F9F8F8',
      borderRadius: 16,
      padding: '36px 32px',
      margin: '56px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: '#8CD4CF'
    }
  }, "Follow along"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '6px 0 0',
      fontFamily: 'Britannic Bold, Georgia, serif',
      fontSize: 40,
      color: '#F9F8F8',
      letterSpacing: '-0.01em'
    }
  }, "Follow ", horse.name, "'s journey!")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "teal",
    size: "lg",
    leadingArrow: true
  }, "Follow Updates"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg"
  }, "Sponsor ", horse.name)))));
};
window.HorseProfileScreen = HorseProfileScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/screens/HorseProfile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/screens/OurCast.jsx
try { (() => {
/* OUR CAST SCREEN — full grid w/ status filter */

const {
  useState
} = React;
const OurCastScreen = ({
  onOpenHorse
}) => {
  const [filter, setFilter] = useState('all');
  const filters = [{
    id: 'all',
    label: 'All'
  }, {
    id: 'rehab',
    label: 'In Rehab'
  }, {
    id: 'adoptable',
    label: 'Adoptable'
  }, {
    id: 'retired',
    label: 'Retired'
  }, {
    id: 'adopted',
    label: 'Adopted'
  }];
  const list = window.HORSES.filter(h => h.status !== 'eternal' && (filter === 'all' || h.status === filter));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "purple-band"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Our Cast"), /*#__PURE__*/React.createElement("p", null, "Each horse here has a name, a personality, a bloodline, and a story. Stop in, look around \u2014 you'll find your favorite.")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    leadingArrow: true
  }, "Sponsor A Horse"))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "filter-row"
  }, filters.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    className: `filter-chip ${filter === f.id ? 'active' : ''}`,
    onClick: () => setFilter(f.id)
  }, f.label))), /*#__PURE__*/React.createElement("div", {
    className: "horse-grid"
  }, list.map(h => /*#__PURE__*/React.createElement(HorseCard, {
    key: h.id,
    horse: h,
    onOpen: onOpenHorse
  }))), list.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "muted center",
    style: {
      padding: '60px 0'
    }
  }, "No horses match this filter \u2014 try another."))));
};
window.OurCastScreen = OurCastScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/screens/OurCast.jsx", error: String((e && e.message) || e) }); }

})();
