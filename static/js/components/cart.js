(function() {
    if (
      // No Reflect, no classes, no need for shim because native custom elements
      // require ES2015 classes or Reflect.
      window.Reflect === undefined ||
      window.customElements === undefined ||
      // The webcomponentsjs custom elements polyfill doesn't require
      // ES2015-compatible construction (`super()` or `Reflect.construct`).
      window.customElements.polyfillWrapFlushCallback
    ) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    /**
     * With jscompiler's RECOMMENDED_FLAGS the function name will be optimized away.
     * However, if we declare the function as a property on an object literal, and
     * use quotes for the property name, then closure will leave that much intact,
     * which is enough for the JS VM to correctly set Function.prototype.name.
     */
    const wrapperForTheName = {
      'HTMLElement': /** @this {!Object} */ function HTMLElement() {
        return Reflect.construct(
            BuiltInHTMLElement, [], /** @type {!Function} */ (this.constructor));
      }
    };
    window.HTMLElement = wrapperForTheName['HTMLElement'];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var cartItemTemplate = document.createElement('template');
cartItemTemplate.innerHTML = "   \n    <img class=\"preview\" style=\"width:96px\" />\n    <span class=\"remove\"></span>\n    <span class=\"out_of_stock\">\u0646\u0627\u0645\u0648\u062C\u0648\u062F</span>\n    <number-box initial=\"1\" class=\"quantity\"></number-box>\n\n    <div class=\"detail\">\n        <h3 class=\"title\"></h3>\n        <h5 class=\"boutique\"></h5>\n        <p class=\"description\"></p>\n        <span class=\"price\"></span>\n        <div class=\"action\">\n            <combo-box id=\"colors\" placeholder=\"\u0631\u0646\u06AF\">\n            </combo-box>\n            <combo-box id=\"sizes\" placeholder=\"\u0633\u0627\u06CC\u0632\"></combo-box>\n        </div>\n    </div>\n    \n";
var CartItem = /** @class */ (function (_super) {
    __extends(CartItem, _super);
    function CartItem() {
        var _a;
        var _this = _super.call(this) || this;
        // this.attachShadow({ mode: 'open' });
        _this.appendChild(cartItemTemplate.content.cloneNode(true));
        _this._pid = (_a = parseInt(_this.getAttribute('pid'))) !== null && _a !== void 0 ? _a : -1;
        _this._slider = _this.querySelector('.slider');
        _this.className = 'cart-item';
        return _this;
    }
    CartItem.prototype.connectedCallback = function () {
        this._remove = this._remove.bind(this);
        this._remove_from_server = this._remove_from_server.bind(this);
        this._render();
        this.querySelector('.remove').addEventListener('click', this._remove);
    };
    // attributeChangedCallback(name: string, oldval: string, newval: string){
    // }
    CartItem.prototype._render = function () {
        var parts = this.querySelectorAll('.preview, .title, .boutique, .description, .price');
        parts[0].src = this.preview;
        parts[1].textContent = this.title;
        parts[2].textContent = this.boutique;
        parts[3].textContent = this.description;
        parts[4].textContent = this.price;
        this.toggleStock();
        if (this.noteditable)
            this.querySelector('.action').classList.add('hide');
        var color_box = this.querySelector('#colors');
        var size_box = this.querySelector('#sizes');
        color_box.appendChild(this._prepareColors());
        size_box.appendChild(this._prepareSizes());
    };
    CartItem.prototype._prepareColors = function () {
        var frag = document.createDocumentFragment();
        for (var _i = 0, _a = this.colors; _i < _a.length; _i++) {
            var color = _a[_i];
            var comboboxItem = document.createElement('combo-box-item');
            comboboxItem.setAttribute('caption', color.name);
            comboboxItem.setAttribute('value', color.id);
            var circ = document.createElement('span');
            circ.className = 'circ';
            circ.style.backgroundColor = color.code;
            comboboxItem.appendChild(circ);
            frag.appendChild(comboboxItem);
        }
        return frag;
    };
    CartItem.prototype._prepareSizes = function () {
        var frag = document.createDocumentFragment();
        for (var _i = 0, _a = this.sizes; _i < _a.length; _i++) {
            var size = _a[_i];
            var comboboxItem = document.createElement('combo-box-item');
            comboboxItem.setAttribute('caption', size.code);
            comboboxItem.setAttribute('value', size.id);
            frag.appendChild(comboboxItem);
        }
        return frag;
    };
    Object.defineProperty(CartItem.prototype, "noteditable", {
        get: function () {
            var val = this.getAttribute('noteditable');
            return ((val === '') || (val === 'true'));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "pid", {
        get: function () {
            return parseInt(this.getAttribute('pid'));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "title", {
        get: function () {
            return this.getAttribute('title');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "boutique", {
        get: function () {
            return this.getAttribute('boutique');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "price", {
        get: function () {
            return this.getAttribute('price');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "description", {
        get: function () {
            return this.getAttribute('description');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "preview", {
        get: function () {
            return this.getAttribute('preview');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "outofstock", {
        get: function () {
            var val = this.getAttribute('outofstock');
            return (val === '') || (val === 'true');
        },
        enumerable: false,
        configurable: true
    });
    CartItem.prototype.toggleStock = function () {
        var label = this.querySelector('.out_of_stock');
        console.log('toggle stock', this.outofstock);
        if (this.outofstock) {
            label.classList.add('pinned');
            console.log('pinned');
        }
        else {
            label.classList.remove('pinned');
        }
    };
    CartItem.prototype.decodeColors = function (code) {
        //codeform:: id:name:code,...
        //separator: ,
        var subs = code.split(',');
        var decoded = subs.map(function (i) {
            var d = i.split(':');
            if (d.length !== 3)
                throw new Error('Invalid inputs');
            var cc = {
                id: d[0],
                name: d[1],
                code: d[2]
            };
            return cc;
        });
        return decoded;
    };
    CartItem.prototype.decodeSizes = function (code) {
        var subs = code.split(',');
        var decoded = subs.map(function (i) {
            var d = i.split(':');
            if (d.length !== 2)
                throw new Error('Invalid inputs');
            var c = {
                id: d[0],
                code: d[1]
            };
            return c;
        });
        return decoded;
    };
    Object.defineProperty(CartItem.prototype, "colors", {
        get: function () {
            var _a;
            var color_code = (_a = this.getAttribute('colors')) !== null && _a !== void 0 ? _a : '';
            return this.decodeColors(color_code);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "sizes", {
        get: function () {
            var _a;
            var size_code = (_a = this.getAttribute('sizes')) !== null && _a !== void 0 ? _a : '';
            return this.decodeSizes(size_code);
        },
        enumerable: false,
        configurable: true
    });
    CartItem.prototype._addToFavourite = function () {
    };
    CartItem.prototype._setColor = function () {
    };
    CartItem.prototype._seteSize = function () {
    };
    CartItem.prototype._setQuantity = function () { };
    CartItem.prototype.updateServer = function () {
        this._setColor();
        this._seteSize();
        this._setQuantity();
    };
    CartItem.prototype._remove_from_server = function () {
        console.log('remove from server');
    };
    CartItem.prototype._remove = function () {
        console.log('remove issued...');
        this._remove_from_server();
        this.remove();
    };
    return CartItem;
}(HTMLElement));
customElements.define('cart-item', CartItem);
