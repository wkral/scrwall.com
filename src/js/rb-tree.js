function SortedTree() {
    return {
        tree: this,
        put: function(k, v) {
            var node = {black: false, key: k, value: v};
            if(this.head == null) {
                this.head = node;
            } else {
                _insert(this.head, node);
            }
            _check1(node, this);
        },
        get: function(k, d) {
            var node = _find(this.head, k);
            if(node == null) return d;
            return node.value;
        }
    };
}

function _insert(t, n) {
    var side = n.key < t.key ? 'left' : 'right';
    if(t[side] == null) {
        t[side] = n;
        n.parent = t;
    } else
        _insert(t[side], n);
}

function _find(t, k) {
    if(t == null || t.key == k) {
        return t;
    }
    return _find(k < t.key ? t.left : t.right, k);
}

function _depth(t, max) {
    if(max == null) max = 0;
    if(t == null) return max;
    var left = _depth(t.left, max + 1);
    var right = _depth(t.right, max + 1);
    return left > right ? left : right;
}

function _check1(n, tree) {
    if(n.parent == null)
        n.black = true;
    else
        _check2(n, tree);
}

function _check2(n, tree) {
    if(n.parent.black)
        return;
    _check3(n, tree);
}

function _check3(n, tree) {
    var p = n.parent;
    var g = p.parent;
    var u = null;
    if(g != null)
        u = g.left == p ? g.right : g.left;

    if(u != null && !u.black) {
        p.black = true;
        u.black = true;
        g.black = false;
        _check1(g, tree);
    } else
        _check4(n, p, g, tree);
}

function _check4(n, p, g, tree) {
    if(n == p.right && p == g.left) {
        _rotate(p, 'left', tree);
        n = p;
    } else if (n == p.left && p == g.right) {
        _rotate(p, 'right', tree)
        n = p;
    }
    _check5(n, tree);
}

function _check5(n, tree) {
    var g = n.parent.parent;
    n.parent.black = true;
    g.black = false;
    if(n == n.parent.left && n.parent == g.left) {
        _rotate(g, 'right', tree);
    } else if (n == n.parent.right && n.parent == g.right ){
        _rotate(g, 'left', tree);
    }
}

function _rotate(root, direction, tree) {

    var rs = direction;
    var os = rs == 'left' ? 'right' : 'left';
    var pivot = root[os];
    var supertree = root.parent;
    root[os] = pivot[rs];
    if(pivot[rs] != null)
        pivot[rs].parent = root;
    pivot[rs] = root;
    root.parent = pivot;
    if(supertree == null) {
        tree.head = pivot;
    } else {
        var superside = supertree.left == root ? 'left' : 'right';
        supertree[superside] = pivot;
    }
    pivot.parent = supertree;

}

function _to_string(n) {
    var right = null;
    var left = null;
    if(n.left != null) left = _to_string(n.left);
    if(n.right != null) right = _to_string(n.right);
    return '[ ' + n.key + ' ' + left + ' ' + right + ' ]';
}