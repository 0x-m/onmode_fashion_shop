
const cartItemTemplate = document.createElement('template');
cartItemTemplate.innerHTML = `   
    <img class="preview" style="width:96px" />
    <span class="remove"></span>
    <span class="out_of_stock">ناموجود</span>
    <number-box initial="1" class="quantity"></number-box>

    <div class="detail">
        <h3 class="title"></h3>
        <h5 class="boutique"></h5>
        <p class="description"></p>
        <span class="price"></span>
        <div class="action">
            <combo-box id="colors" placeholder="رنگ">
            </combo-box>
            <combo-box id="sizes" placeholder="سایز"></combo-box>
        </div>
    </div>
    
`;

interface Color {
    id: string,
    name: string,
    code: string
}

interface Size {
    id: string,
    code: string
}

class CartItem extends HTMLElement {

    private _pid: number;
    private _slider:HTMLDivElement;
    constructor() {
        super();
       // this.attachShadow({ mode: 'open' });
        this.appendChild(cartItemTemplate.content.cloneNode(true));
        this._pid =  parseInt(this.getAttribute('pid')) ?? -1;
        this._slider = this.querySelector('.slider');
        this.className = 'cart-item';

    }

    connectedCallback() {
        this._remove = this._remove.bind(this);
        this._remove_from_server = this._remove_from_server.bind(this);
        this._render();
        this.querySelector('.remove').addEventListener('click', this._remove);
    }

    // attributeChangedCallback(name: string, oldval: string, newval: string){

    // }


    private _render() {
       const parts = this.querySelectorAll('.preview, .title, .boutique, .description, .price');
       
       (parts[0] as HTMLImageElement)!.src = this.preview;
       (parts[1] as HTMLHeadingElement)!.textContent = this.title;
       (parts[2] as HTMLHeadingElement)!.textContent = this.boutique;
       (parts[3] as HTMLParagraphElement)!.textContent = this.description;
       (parts[4] as HTMLSpanElement)!.textContent = this.price;

       this.toggleStock();

       if (this.noteditable)
        this.querySelector('.action').classList.add('hide');

       const color_box = this.querySelector('#colors');
       const size_box = this.querySelector('#sizes');
       color_box.appendChild(this._prepareColors());
       size_box.appendChild(this._prepareSizes());

      


    }

    private _prepareColors(): DocumentFragment{
        const frag = document.createDocumentFragment();
        for (const color of this.colors){
            const comboboxItem = document.createElement('combo-box-item');
            comboboxItem.setAttribute('caption', color.name);
            comboboxItem.setAttribute('value', color.id);
            const circ = document.createElement('span');
            circ.className = 'circ';
            circ.style.backgroundColor = color.code;
            comboboxItem.appendChild(circ);
            frag.appendChild(comboboxItem);
        }
        return frag;
    }


    private _prepareSizes() {
        const frag = document.createDocumentFragment();
        for (const size of this.sizes){
            const comboboxItem = document.createElement('combo-box-item');
            comboboxItem.setAttribute('caption', size.code);
            comboboxItem.setAttribute('value', size.id);
            frag.appendChild(comboboxItem);
        }
        return frag;
    }


    get noteditable() {
        const val = this.getAttribute('noteditable');
        return ( (val === '') || (val === 'true') );
    }


    get pid(): number {
        return parseInt(this.getAttribute('pid'));
    }


    get title(): string {
       return this.getAttribute('title');
    }

    get boutique(): string {
        return this.getAttribute('boutique');
    }

    get price(): string {
        return this.getAttribute('price');
    }

    get description(): string {
        return this.getAttribute('description');
    }

    get preview(): string {
        return this.getAttribute('preview');
    }

    get outofstock() {
        const val = this.getAttribute('outofstock');
        return (val === '') || (val === 'true');
    }

    private toggleStock() {

        const label = this.querySelector('.out_of_stock');
        console.log('toggle stock', this.outofstock);
        if (this.outofstock) {
            label.classList.add('pinned');
            console.log('pinned');
        }
        else {
            label.classList.remove('pinned');
        }
    }
    private decodeColors(code: string): Array<Color> {
        //codeform:: id:name:code,...
        //separator: ,
        
        const subs = code.split(',');
        const decoded = subs.map(i => {
            const d = i.split(':');
            if (d.length !== 3)
                throw new Error('Invalid inputs');
            const cc: Color = {
                id: d[0],
                name: d[1],
                code: d[2]
            }
            return cc;

        });
        return decoded;
    }

    private decodeSizes(code: string): Array<Size> {
        const subs = code.split(',');
        const decoded = subs.map(i => {
            const d = i.split(':');
            if (d.length !== 2)
                throw new Error('Invalid inputs');
            const c: Size = {
                id: d[0],
                code: d[1]
            }
            return c;
        });

        return decoded;
    }

    get colors(){
        const color_code = this.getAttribute('colors') ?? ''
        return this.decodeColors(color_code);
    }
        
    get sizes() {
        const size_code = this.getAttribute('sizes') ?? '';
        return this.decodeSizes(size_code);
    }

  
    private _addToFavourite() {

    }
    private _setColor() {

    }

    private _seteSize() {

    }
    private _setQuantity() {}

    public updateServer() {
        this._setColor();
        this._seteSize();
        this._setQuantity();
    }

    private _remove_from_server() {
        console.log('remove from server');
    }
    private _remove() {
        console.log('remove issued...');
        this._remove_from_server();
        this.remove();
    }
}

customElements.define('cart-item', CartItem);

