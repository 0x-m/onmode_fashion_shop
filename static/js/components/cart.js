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
cartItemTemplate.innerHTML = "   \n    <img class=\"preview\" style=\"width:96px\" />\n    <span class=\"remove\"></span>\n    <span class=\"cart-badge\"></span>\n    <number-box class=\"quantity\"></number-box>\n\n    <div class=\"detail\">\n        <h3 class=\"title\"></h3>\n        <h5 class=\"boutique\"></h5>\n        <p class=\"description\"></p>\n        <span class=\"price\"></span>\n        <span class=\"discounted_price\"></span>\n        <div class=\"action\">\n            <combo-box id=\"colors\" placeholder=\"\u0631\u0646\u06AF\">\n            </combo-box>\n            <combo-box id=\"sizes\" placeholder=\"\u0633\u0627\u06CC\u0632\"></combo-box>\n        </div>\n    </div>\n    \n";
var CartItem = /** @class */ (function (_super) {
    __extends(CartItem, _super);
    function CartItem() {
        var _a;
        var _this = _super.call(this) || this;
        // this.attachShadow({ mode: 'open' });
        _this.appendChild(cartItemTemplate.content.cloneNode(true));
        _this._pid = (_a = parseInt(_this.getAttribute('pid'))) !== null && _a !== void 0 ? _a : -1;
        _this.className = 'cart-item';
        return _this;
    }
    CartItem.prototype.connectedCallback = function () {
        var _this = this;
        var _a;
        this._remove = this._remove.bind(this);
        this._remove_from_server = this._remove_from_server.bind(this);
        this._render();
        this.querySelector('.remove').addEventListener('click', this._remove);
        var quant = this.querySelector('.quantity');
        quant.setAttribute('value', (_a = this.quantity) !== null && _a !== void 0 ? _a : "1");
        quant.addEventListener('onincrement', function () { get('/cart/increment/' + _this._pid + '/', function (resp, status) { 
            update_cart_badge('increment'); 
            const s = JSON.parse(resp);
            document.getElementById('total_price').innerText = s['total'];
            document.getElementById("in-cart-num").innerText = s['num'];

        }); });
        quant.addEventListener('ondecrement', function () { get('/cart/decrement/' + _this._pid + '/', function (resp, status) { 
            update_cart_badge('decrement'); 
            const s = JSON.parse(resp);
            document.getElementById('total_price').innerText = s['total'];
            document.getElementById("in-cart-num").innerText = s['num'];


        }); });
        this.querySelector('#colors').addEventListener('onselectedchange', function () { get('/cart/set_color/?product_id=' + _this.pid + '&color_id=' + _this.selected_color); });
        this.querySelector('#sizes').addEventListener('onselectedchange', function () { get('/cart/set_size/?product_id=' + _this.pid + '&size_id=' + _this.selected_size); });
    };
    CartItem.prototype._render = function () {
        var parts = this.querySelectorAll('.preview, .cart-badge, .title, .boutique, .description, .price, .discounted_price');
        parts[0].src = this.preview;
        parts[1].textContent = this.badge;
        parts[2].textContent = this.title;
        parts[3].textContent = this.boutique;
        parts[4].textContent = this.description;
        parts[5].textContent = this.price;
        parts[6].textContent = this.discounted_price;
        this.toggleBage();
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
    Object.defineProperty(CartItem.prototype, "quantity", {
        get: function () {
            return this.getAttribute('quantity');
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
    Object.defineProperty(CartItem.prototype, "badge", {
        get: function () {
            return this.getAttribute('badge');
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
    Object.defineProperty(CartItem.prototype, "discounted_price", {
        get: function () {
            return this.getAttribute('discounted_price');
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
    Object.defineProperty(CartItem.prototype, "selected_color", {
        get: function () {
            var selected = this.querySelector('#colors').selectedItems;
            if (selected) {
                return selected[0];
            }
            return '';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CartItem.prototype, "selected_size", {
        get: function () {
            var selected = this.querySelector('#sizes').selectedItems;
            if (selected) {
                return selected[0];
            }
            return '';
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
    CartItem.prototype.toggleBage = function () {
        var bg = this.querySelector('.cart-badge');
        if (this.badge !== '') {
            bg.classList.add('pinned');
        }
        else {
            bg.classList.remove('pinned');
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
    CartItem.prototype._setQuantity = function () {
    };
    CartItem.prototype.updateServer = function () {
        this._setColor();
        this._seteSize();
        this._setQuantity();
    };
    CartItem.prototype._remove_from_server = function () {
    };
    CartItem.prototype._remove = function (e) {
        get('/cart/remove/' + this.pid + '/', (function (a) {
            return function (resp, status) {
                if (status === 200) {
                    update_cart_badge('subtract', a.quantity);
                    const s = JSON.parse(resp);
                    document.getElementById('total_price').innerText = s['total'];        
                    document.getElementById("in-cart-num").innerText = s['num'];
                    a.remove();
                }
            };
        })(this));
    };
    return CartItem;
}(HTMLElement));
customElements.define('cart-item', CartItem);
