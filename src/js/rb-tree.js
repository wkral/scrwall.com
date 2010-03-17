function SortedTree() {
    function insert(t, n) {
        var side = n.key < t.key ? 'left' : 'right';
        if(n.key == t.key) {
            t.value = t.value.concat(n.value);
        } else if (t[side] == null) {
            t[side] = n;
            n.parent = t;
        } else
            insert(t[side], n);
    }

    function find(n, k) {
        if(n == null || n.key == k) {
            return n;
        }
        return find(k < n.key ? n.left : n.right, k);
    }

    function find_range(n, s, f) {
        if(n == null) return [];
        if(n.key < s) {
            return find_range(n.right, s, f);
        } else if (n.key > f) {
            return find_range(n.left, s, f);
        }
        return find_range(n.left, s, f).concat(n.value, find_range(n.right, s, f));
    }

    function depth(t, max) {
        if(max == null) max = 0;
        if(t == null) return max;
        var left = depth(t.left, max + 1);
        var right = depth(t.right, max + 1);
        return left > right ? left : right;
    }

    function check1(n, tree) {
        if(n.parent == null)
            n.black = true;
        else
            check2(n, tree);
    }

    function check2(n, tree) {
        if(n.parent.black)
            return;
        check3(n, tree);
    }

    function check3(n, tree) {
        var p = n.parent;
        var g = p.parent;
        var u = null;
        if(g != null)
            u = g.left == p ? g.right : g.left;

        if(u != null && !u.black) {
            p.black = true;
            u.black = true;
            g.black = false;
            check1(g, tree);
        } else
            check4(n, p, g, tree);
    }

    function check4(n, p, g, tree) {
        if(n == p.right && p == g.left) {
            rotate(p, 'left', tree);
            n = p;
        } else if (n == p.left && p == g.right) {
            rotate(p, 'right', tree)
            n = p;
        }
        check5(n, tree);
    }

    function check5(n, tree) {
        var g = n.parent.parent;
        n.parent.black = true;
        g.black = false;
        if(n == n.parent.left && n.parent == g.left) {
            rotate(g, 'right', tree);
        } else if (n == n.parent.right && n.parent == g.right ){
            rotate(g, 'left', tree);
        }
    }

    function rotate(root, rs, tree) {

        var os = rs == 'left' ? 'right' : 'left';
        var pivot = root[os];
        var parent = root.parent;
        root[os] = pivot[rs];
        if(pivot[rs] != null)
            pivot[rs].parent = root;
        pivot[rs] = root;
        root.parent = pivot;
        if(parent == null) {
            tree.head = pivot;
        } else {
            var parent_side = parent.left == root ? 'left' : 'right';
            parent[parent_side] = pivot;
        }
        pivot.parent = parent;

    }

    function to_string(n) {
        var right = null;
        var left = null;
        if(n.left != null) left = to_string(n.left);
        if(n.right != null) right = to_string(n.right);
        return '[ ' + n.key + ' ' + left + ' ' + right + ' ]';
    }

    return {
        put: function(k, v) {
            var node = {black: false, key: k, value: [v]};
            if(this.head == null) {
                this.head = node;
            } else {
                insert(this.head, node);
            }
            check1(node, this);
        },
        get: function(k, d) {
            var node = find(this.head, k);
            if(node == null) return d;
            return node.value;
        },
        range: function(start, finish) {
            return find_range(this.head, start, finish);
        },
        depth: function() {
            return depth(this.head, 0);
        }
    };
}
