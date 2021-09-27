
const drawerTemplate = document.createElement('template');
drawerTemplate.innerHTML = `

    <template id="loading">
        <div id="overlay"  class="container horizontal justify-content align-items w-100 h-100 loader-overlay">
            <div class="loader position--center"></div>
        </div>
    </template>
    <div class="drawer">
        <div class="header">
            <span class="close"></span>
        </div>
        <div class="content">
        </div>
        <div class="footer">
        </div>
    </div>

`;
class Drawer extends HTMLElement {

    get state() {
        return this.status;
    }
    constructor() {
        super();
        this.status = 'closed';
        this.open = this.open.bind(this);
        this.appendChild(drawerTemplate.content.cloneNode(true));
        const drawer = this.querySelector('.drawer');
        this.drawer = drawer;
        this.querySelector(".close").addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });   

        document.addEventListener('click', () => {
            this.close();
        });
        this.addEventListener('click', (e) => {
            e.stopPropagation();
        })

    }

    open() {
        event.preventDefault();
        event.stopPropagation();
        this.drawer.classList.add('drawer-open');
        this.status = 'opened';
        document.body.classList.add('no-scroll');

    }

    close() {
        this.drawer.classList.remove('drawer-open');
        this.status = 'closed';
        this._clear();
        document.body.classList.remove('no-scroll');

    }

    _clear() {
        this.querySelector('.content').innerHTML = '';
        this.querySelector('.footer').innerHTML = '';
        const h = this.querySelector('.header');
        if (h.children.length == 2){
            h.children[1].remove();
        }
       
    }

    showLoader() {
       const loaderTemp = this.querySelector('#loading');
       this.querySelector('.content').appendChild(loaderTemp.content.cloneNode(true));
    }

    hideLoader() {
        const overlay = this.querySelector('#overlay');
        overlay.remove();
    }



    setContent(val) {
        this.querySelector('.content').innerHTML = val;
    }
    setcc(val) {
        
        this.querySelector('.content').replaceChildren(val);
    }

    addHeader(val) {
        this.querySelector('.header').appendChild = val;
    }

    addFooter(val) {
        this.querySelector('.footer').appendChild = val;
    }
   
}

customElements.define('my-drawer', Drawer);
