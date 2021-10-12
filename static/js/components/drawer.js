
const drawerTemplate = document.createElement('template');
drawerTemplate.innerHTML = `

    <template id="loading">
        <div id="overlay"  class="container horizontal justify-content align-items loader-overlay">
            <div class="loader position--center"></div>
        </div>
    </template>
    <div class="drawer">
        <div class="header">
            <span class="close"></span>
        </div>
        <div class="content" >
        </div>
        <div class="footer">
        </div>
    </div>

`;
class Drawer extends HTMLElement {

    get state() {
        return this.status;
    }

    get content() {
        return this.querySelector('.content').innerHTML;
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
        document.getElementById('body-overlay').style.display = 'block'

    }

    close() {
        this.drawer.classList.remove('drawer-open');
        this.status = 'closed';
        this._clear();
        document.body.classList.remove('no-scroll');
        document.getElementById('body-overlay').style.display = 'none'


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
       this.querySelector('.content').scroll({
           top: 0,
           behavior:"smooth"
       });
       this.querySelector('.content').appendChild(loaderTemp.content.cloneNode(true));
       this.querySelector('.content').style.overflow = 'hidden';
       
    }

    hideLoader() {
        const overlay = this.querySelector('#overlay');
        if (overlay){
            overlay.remove();
        }
        this.querySelector('.content').style.overflow = 'auto';
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
