const states = {
    UNSEEN: 0,
    VIEWED: 1,
    VISITED: 2,
};

const types = {
    AIR: 0,
    WALL: 1,
}

class Hex {
    q = NaN;
    r = NaN;
    s = NaN;
    type = null;
    state = null;

    constructor(_q, _r, _s = null) {
        this.q = _q;
        this.r = _r;
        this.s = (_s ? _s : -_q-_r);
        this.type = types.AIR;
        this.state = states.UNSEEN;
    }
};
