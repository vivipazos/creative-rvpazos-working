
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/svelte-inline-svg/src/inline-svg.svelte generated by Svelte v3.35.0 */

    const { Error: Error_1, console: console_1 } = globals;
    const file$1 = "node_modules/svelte-inline-svg/src/inline-svg.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let mounted;
    	let dispose;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*svgAttrs*/ ctx[0],
    		exclude(/*$$props*/ ctx[2], ["src", "transformSrc"]),
    		{ contenteditable: "true" }
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    			if (/*svgContent*/ ctx[1] === void 0) add_render_callback(() => /*svg_input_handler*/ ctx[5].call(svg));
    			add_location(svg, file$1, 107, 0, 2662);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (/*svgContent*/ ctx[1] !== void 0) {
    				svg.innerHTML = /*svgContent*/ ctx[1];
    			}

    			if (!mounted) {
    				dispose = listen_dev(svg, "input", /*svg_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*svgAttrs*/ 1 && /*svgAttrs*/ ctx[0],
    				dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["src", "transformSrc"]),
    				{ contenteditable: "true" }
    			]));

    			if (dirty & /*svgContent*/ 2 && /*svgContent*/ ctx[1] !== svg.innerHTML) {
    				svg.innerHTML = /*svgContent*/ ctx[1];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function exclude(obj, exclude) {
    	Object.keys(obj).filter(key => exclude.includes(key)).forEach(key => delete obj[key]);
    	return obj;
    }

    function filterAttrs(attrs) {
    	return Object.keys(attrs).reduce(
    		(result, key) => {
    			if (attrs[key] !== false && attrs[key] !== null && attrs[key] !== undefined) {
    				result[key] = attrs[key];
    			}

    			return result;
    		},
    		{}
    	);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Inline_svg", slots, []);
    	const dispatch = createEventDispatcher();
    	let { src } = $$props;
    	let { transformSrc = svg => svg } = $$props;

    	onMount(() => {
    		inline(src);
    	});

    	let cache = {};
    	let isLoaded = false;
    	let svgAttrs = {};
    	let svgContent;

    	function download(url) {
    		return new Promise((resolve, reject) => {
    				const request = new XMLHttpRequest();
    				request.open("GET", url, true);

    				request.onload = () => {
    					if (request.status >= 200 && request.status < 400) {
    						try {
    							// Setup a parser to convert the response to text/xml in order for it to be manipulated and changed
    							const parser = new DOMParser();

    							const result = parser.parseFromString(request.responseText, "text/xml");
    							let svgEl = result.querySelector("svg");

    							if (svgEl) {
    								// Apply transformation
    								svgEl = transformSrc(svgEl);

    								resolve(svgEl);
    							} else {
    								reject(new Error("Loaded file is not valid SVG\""));
    							}
    						} catch(error) {
    							reject(error);
    						}
    					} else {
    						reject(new Error("Error loading SVG"));
    					}
    				};

    				request.onerror = reject;
    				request.send();
    			});
    	}

    	function inline(src) {
    		// fill cache by src with promise
    		if (!cache[src]) {
    			// notify svg is unloaded
    			if (isLoaded) {
    				isLoaded = false;
    				dispatch("unloaded");
    			}

    			// download
    			cache[src] = download(src);
    		}

    		// inline svg when cached promise resolves
    		cache[src].then(async svg => {
    			// copy attrs
    			const attrs = svg.attributes;

    			for (let i = attrs.length - 1; i >= 0; i--) {
    				$$invalidate(0, svgAttrs[attrs[i].name] = attrs[i].value, svgAttrs);
    			}

    			// copy inner html
    			$$invalidate(1, svgContent = svg.innerHTML);

    			// render svg element
    			await tick();

    			isLoaded = true;
    			dispatch("loaded");
    		}).catch(error => {
    			// remove cached rejected promise so next image can try load again
    			delete cache[src];

    			console.error(error);
    		});
    	}

    	function svg_input_handler() {
    		svgContent = this.innerHTML;
    		$$invalidate(1, svgContent);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("src" in $$new_props) $$invalidate(3, src = $$new_props.src);
    		if ("transformSrc" in $$new_props) $$invalidate(4, transformSrc = $$new_props.transformSrc);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		tick,
    		dispatch,
    		src,
    		transformSrc,
    		cache,
    		isLoaded,
    		svgAttrs,
    		svgContent,
    		exclude,
    		filterAttrs,
    		download,
    		inline
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("src" in $$props) $$invalidate(3, src = $$new_props.src);
    		if ("transformSrc" in $$props) $$invalidate(4, transformSrc = $$new_props.transformSrc);
    		if ("cache" in $$props) cache = $$new_props.cache;
    		if ("isLoaded" in $$props) isLoaded = $$new_props.isLoaded;
    		if ("svgAttrs" in $$props) $$invalidate(0, svgAttrs = $$new_props.svgAttrs);
    		if ("svgContent" in $$props) $$invalidate(1, svgContent = $$new_props.svgContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [svgAttrs, svgContent, $$props, src, transformSrc, svg_input_handler];
    }

    class Inline_svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { src: 3, transformSrc: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Inline_svg",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[3] === undefined && !("src" in props)) {
    			console_1.warn("<Inline_svg> was created without expected prop 'src'");
    		}
    	}

    	get src() {
    		throw new Error_1("<Inline_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error_1("<Inline_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transformSrc() {
    		throw new Error_1("<Inline_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transformSrc(value) {
    		throw new Error_1("<Inline_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let inlinesvg0;
    	let t0;
    	let div1;
    	let inlinesvg1;
    	let t1;
    	let div2;
    	let h1;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let div3;
    	let inlinesvg2;
    	let t8;
    	let div4;
    	let inlinesvg3;
    	let current;

    	inlinesvg0 = new Inline_svg({
    			props: { src: introDesktop },
    			$$inline: true
    		});

    	inlinesvg1 = new Inline_svg({
    			props: { src: introMobile },
    			$$inline: true
    		});

    	inlinesvg2 = new Inline_svg({
    			props: { src: introDesktop },
    			$$inline: true
    		});

    	inlinesvg3 = new Inline_svg({
    			props: { src: introMobile },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(inlinesvg0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(inlinesvg1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "60 days, 60 moves";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "An exploration of emotions, tracked with data, visualised through dance.";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "By Rebecca Pazos";
    			t7 = space();
    			div3 = element("div");
    			create_component(inlinesvg2.$$.fragment);
    			t8 = space();
    			div4 = element("div");
    			create_component(inlinesvg3.$$.fragment);
    			attr_dev(div0, "class", "introDesktop svelte-177phz2");
    			add_location(div0, file, 8, 1, 193);
    			attr_dev(div1, "class", "introMobile svelte-177phz2");
    			add_location(div1, file, 12, 1, 264);
    			attr_dev(h1, "class", "svelte-177phz2");
    			add_location(h1, file, 17, 2, 356);
    			attr_dev(p0, "class", "deck svelte-177phz2");
    			add_location(p0, file, 18, 2, 385);
    			attr_dev(p1, "class", "byline svelte-177phz2");
    			add_location(p1, file, 19, 2, 480);
    			attr_dev(div2, "class", "header svelte-177phz2");
    			add_location(div2, file, 16, 1, 333);
    			attr_dev(main, "class", "svelte-177phz2");
    			add_location(main, file, 6, 0, 165);
    			attr_dev(div3, "class", "introDesktop svelte-177phz2");
    			add_location(div3, file, 23, 0, 536);
    			attr_dev(div4, "class", "introMobile svelte-177phz2");
    			add_location(div4, file, 27, 0, 604);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(inlinesvg0, div0, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(inlinesvg1, div1, null);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t3);
    			append_dev(div2, p0);
    			append_dev(div2, t5);
    			append_dev(div2, p1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(inlinesvg2, div3, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(inlinesvg3, div4, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inlinesvg0.$$.fragment, local);
    			transition_in(inlinesvg1.$$.fragment, local);
    			transition_in(inlinesvg2.$$.fragment, local);
    			transition_in(inlinesvg3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inlinesvg0.$$.fragment, local);
    			transition_out(inlinesvg1.$$.fragment, local);
    			transition_out(inlinesvg2.$$.fragment, local);
    			transition_out(inlinesvg3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(inlinesvg0);
    			destroy_component(inlinesvg1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div3);
    			destroy_component(inlinesvg2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div4);
    			destroy_component(inlinesvg3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const introDesktop = "build/assets/3-vaccines.svg";
    const introMobile = "build/assets/mobile.svg";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ InlineSVG: Inline_svg, introDesktop, introMobile });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
