const initialState = {
    open: false,
    title: null,
    body: null,
    closeMsg: null,
    img: null,
    pdf: null,
    customStyle: null,
    aboutToClose: false,
    animateOut: null,
    animateIn: null
}

export default function modal(state = initialState, action) {
    switch (action.type) {
        case 'MODAL_OPEN':
            return {...state,
                open: true,
                title: action.modal.title,
                body: action.modal.body,
                closeMsg: action.modal.closeMsg,
                img: action.modal.img,
                pdf: action.modal.pdf,
                customStyle: action.modal.customStyle,
                animateIn: action.modal.animateIn
            }
        case 'MODAL_CLOSE':
            return {...state,
                open: false,
                title: null,
                body: null,
                closeMsg: null,
                img: null,
                pdf: null,
                customStyle: null,
                animateIn: null,
                aboutToClose: false,
                animateOut: null
            }
        case 'MODAL_ABOUT_TO_CLOSE':
            return {...state,
                aboutToClose: true,
                animateOut: action.animateOut
            }
        default:
            return state
    }
}