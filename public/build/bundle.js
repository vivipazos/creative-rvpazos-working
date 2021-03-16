
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
    	let style;
    	let t1;
    	let div0;
    	let inlinesvg0;
    	let t2;
    	let div1;
    	let inlinesvg1;
    	let t3;
    	let main;
    	let div2;
    	let h1;
    	let t5;
    	let p0;
    	let t7;
    	let p1;
    	let t9;
    	let div9;
    	let p2;
    	let p3;
    	let t12;
    	let p4;
    	let t13;
    	let strong0;
    	let t15;
    	let t16;
    	let p5;
    	let t18;
    	let p6;
    	let t19;
    	let strong1;
    	let t21;
    	let strong2;
    	let t23;
    	let t24;
    	let h20;
    	let t25;
    	let strong3;
    	let t27;
    	let t28;
    	let div5;
    	let div3;
    	let inlinesvg2;
    	let t29;
    	let div4;
    	let inlinesvg3;
    	let t30;
    	let h21;
    	let t31;
    	let strong4;
    	let t33;
    	let t34;
    	let div8;
    	let div6;
    	let inlinesvg4;
    	let t35;
    	let div7;
    	let inlinesvg5;
    	let t36;
    	let div14;
    	let h22;
    	let t37;
    	let strong5;
    	let t39;
    	let t40;
    	let div10;
    	let inlinesvg6;
    	let t41;
    	let div11;
    	let inlinesvg7;
    	let t42;
    	let p7;
    	let t44;
    	let h23;
    	let t45;
    	let strong6;
    	let t47;
    	let t48;
    	let div12;
    	let inlinesvg8;
    	let t49;
    	let div13;
    	let inlinesvg9;
    	let t50;
    	let p8;
    	let t52;
    	let h24;
    	let t53;
    	let strong7;
    	let t55;
    	let t56;
    	let p9;
    	let t57;
    	let a0;
    	let t59;
    	let t60;
    	let p10;
    	let t61;
    	let a1;
    	let t63;
    	let t64;
    	let p11;
    	let t65;
    	let a2;
    	let t67;
    	let strong8;
    	let t69;
    	let t70;
    	let p12;
    	let t72;
    	let h25;
    	let t73;
    	let strong9;
    	let t75;
    	let video;
    	let video_src_value;
    	let t76;
    	let p13;
    	let t77;
    	let a3;
    	let t79;
    	let a4;
    	let t81;
    	let current;

    	inlinesvg0 = new Inline_svg({
    			props: { src: introDesktop },
    			$$inline: true
    		});

    	inlinesvg1 = new Inline_svg({
    			props: { src: introMobile },
    			$$inline: true
    		});

    	inlinesvg2 = new Inline_svg({ props: { src: happySVG }, $$inline: true });

    	inlinesvg3 = new Inline_svg({
    			props: { src: happySVGmobile },
    			$$inline: true
    		});

    	inlinesvg4 = new Inline_svg({ props: { src: angrySVG }, $$inline: true });

    	inlinesvg5 = new Inline_svg({
    			props: { src: angrySVGmobile },
    			$$inline: true
    		});

    	inlinesvg6 = new Inline_svg({ props: { src: daySVG }, $$inline: true });

    	inlinesvg7 = new Inline_svg({
    			props: { src: daySVGmobile },
    			$$inline: true
    		});

    	inlinesvg8 = new Inline_svg({ props: { src: monthSVG }, $$inline: true });

    	inlinesvg9 = new Inline_svg({
    			props: { src: monthSVGmobile },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			style = element("style");
    			style.textContent = "@import url(\"https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;700&display=swap\");";
    			t1 = space();
    			div0 = element("div");
    			create_component(inlinesvg0.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			create_component(inlinesvg1.$$.fragment);
    			t3 = space();
    			main = element("main");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "50 days, 50 moves";
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "An exploration of emotions, tracked with data, visualised through dance.";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "By Rebecca Pazos";
    			t9 = space();
    			div9 = element("div");
    			p2 = element("p");
    			p2.textContent = "Dance like no-one's watching and the world might just start to feel right again.\n\t\t";
    			p3 = element("p");
    			p3.textContent = "In my exploration of gathering personal data for 50 days, I discovered a new-found appreciation for the art of just dancing without a care in the world.";
    			t12 = space();
    			p4 = element("p");
    			t13 = text("My mission? To explore how ");
    			strong0 = element("strong");
    			strong0.textContent = "mental health";
    			t15 = text(" is quantified during academic study. I wanted to know how human emotions can be given a number, stripped of all it's nuance and meaning. Furthermore, how those numbers could then be used to make assumptions about someone's mental health.");
    			t16 = space();
    			p5 = element("p");
    			p5.textContent = "The following is an exploration of three data points I recorded daily; my sense of purpose, my positive and negative emotions, and any stressful events like arguments or discrimination.";
    			t18 = space();
    			p6 = element("p");
    			t19 = text("Using this data, I then encoded these three points into 5 possible moods: ");
    			strong1 = element("strong");
    			strong1.textContent = "happy, ok, neutral, sad";
    			t21 = text(" and finally, ");
    			strong2 = element("strong");
    			strong2.textContent = "upset";
    			t23 = text(". Each mood has a certain colour and dance step inspired by Laban Movement Analysis techniques.");
    			t24 = space();
    			h20 = element("h2");
    			t25 = text("Breaking down a ");
    			strong3 = element("strong");
    			strong3.textContent = "happy";
    			t27 = text(" day...");
    			t28 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(inlinesvg2.$$.fragment);
    			t29 = space();
    			div4 = element("div");
    			create_component(inlinesvg3.$$.fragment);
    			t30 = space();
    			h21 = element("h2");
    			t31 = text("...compared with a ");
    			strong4 = element("strong");
    			strong4.textContent = "not so happy";
    			t33 = text(" day.");
    			t34 = space();
    			div8 = element("div");
    			div6 = element("div");
    			create_component(inlinesvg4.$$.fragment);
    			t35 = space();
    			div7 = element("div");
    			create_component(inlinesvg5.$$.fragment);
    			t36 = space();
    			div14 = element("div");
    			h22 = element("h2");
    			t37 = text("I found my moods could change ");
    			strong5 = element("strong");
    			strong5.textContent = "every hour";
    			t39 = text(" and for all sorts of reasons.");
    			t40 = space();
    			div10 = element("div");
    			create_component(inlinesvg6.$$.fragment);
    			t41 = space();
    			div11 = element("div");
    			create_component(inlinesvg7.$$.fragment);
    			t42 = space();
    			p7 = element("p");
    			p7.textContent = "This was one Sunday that ended up being a 'neutral' day overall because my sense of purpose was quite low and I was feeling lonely. If it wasn't for the fancy pancakes, it might have been a sadder day.";
    			t44 = space();
    			h23 = element("h2");
    			t45 = text("It seems that ");
    			strong6 = element("strong");
    			strong6.textContent = "Sundays";
    			t47 = text(" are my sadder days. Towards the end, my son had his birthday and this lifted my spirits.");
    			t48 = space();
    			div12 = element("div");
    			create_component(inlinesvg8.$$.fragment);
    			t49 = space();
    			div13 = element("div");
    			create_component(inlinesvg9.$$.fragment);
    			t50 = space();
    			p8 = element("p");
    			p8.textContent = "I was also coming out of a work funk in the beginning and ended on a career high so this helped boost my overall sense of purpose.";
    			t52 = space();
    			h24 = element("h2");
    			t53 = text("Why did I encode ");
    			strong7 = element("strong");
    			strong7.textContent = "data into dance";
    			t55 = text("? It turns out, dancing can help boost your mental health too.");
    			t56 = space();
    			p9 = element("p");
    			t57 = text("This is based entirely on a ");
    			a0 = element("a");
    			a0.textContent = "study that measures how one's";
    			t59 = text(" \"Sense of Purpose Moderates the Assocations between Daily Stressors and Daily Well-being\". These data points are then encoded and indexed against my own averages for the 50 days.");
    			t60 = space();
    			p10 = element("p");
    			t61 = text("The dance moves are inspired by ");
    			a1 = element("a");
    			a1.textContent = "Laban Movmement Analysis";
    			t63 = text(" techniques to portray emotions. For example, the 'happy' movement comes forward in the frame and uses higher hand gestures where the 'upset' movement steps backward in the frame and lowers the head to portray sadness.");
    			t64 = space();
    			p11 = element("p");
    			t65 = text("Finally, I was also inspired by Australian influencer, ");
    			a2 = element("a");
    			a2.textContent = "Shani Chantel";
    			t67 = text(", who lives and breathes all things female empowerment. She began a movement called ");
    			strong8 = element("strong");
    			strong8.textContent = "Free Your Shit Fridays";
    			t69 = text(" that urges women to let themselves dance to their favourite music in their underwear, with their kids on their hips and feel the freedom that comes with dancing.");
    			t70 = space();
    			p12 = element("p");
    			p12.textContent = "Apparently, just listening to music doesn't have quite the same effect but singing can help too!";
    			t72 = space();
    			h25 = element("h2");
    			t73 = text("Go on, throw on your favourite tune, belt out that ballad and ");
    			strong9 = element("strong");
    			strong9.textContent = "shake what your mama gave you!";
    			t75 = space();
    			video = element("video");
    			t76 = space();
    			p13 = element("p");
    			t77 = text("This page was created by Rebecca Pazos for her final project in the creative module for her Masters for Visual Tools with the University of Girona. If you would like to connect with her, she is available on ");
    			a3 = element("a");
    			a3.textContent = "LinkedIn";
    			t79 = text(" and ");
    			a4 = element("a");
    			a4.textContent = "Twitter";
    			t81 = text(".");
    			add_location(style, file, 1, 4, 18);
    			attr_dev(div0, "class", "desktop svelte-1tsaxfq");
    			add_location(div0, file, 26, 0, 755);
    			attr_dev(div1, "class", "mobile svelte-1tsaxfq");
    			add_location(div1, file, 30, 0, 818);
    			attr_dev(h1, "class", "svelte-1tsaxfq");
    			add_location(h1, file, 36, 2, 910);
    			attr_dev(p0, "class", "deck svelte-1tsaxfq");
    			add_location(p0, file, 37, 2, 944);
    			attr_dev(p1, "class", "byline svelte-1tsaxfq");
    			add_location(p1, file, 38, 2, 1039);
    			attr_dev(div2, "class", "header svelte-1tsaxfq");
    			add_location(div2, file, 35, 1, 887);
    			add_location(p2, file, 42, 2, 1113);
    			add_location(p3, file, 43, 2, 1199);
    			add_location(strong0, file, 44, 32, 1391);
    			add_location(p4, file, 44, 2, 1361);
    			add_location(p5, file, 45, 2, 1666);
    			add_location(strong1, file, 46, 94, 1953);
    			add_location(strong2, file, 46, 148, 2007);
    			attr_dev(p6, "class", "endPar svelte-1tsaxfq");
    			add_location(p6, file, 46, 2, 1861);
    			add_location(strong3, file, 48, 22, 2152);
    			attr_dev(h20, "class", "svelte-1tsaxfq");
    			add_location(h20, file, 48, 2, 2132);
    			attr_dev(div3, "class", "desktop svelte-1tsaxfq");
    			add_location(div3, file, 51, 3, 2217);
    			attr_dev(div4, "class", "mobile svelte-1tsaxfq");
    			add_location(div4, file, 55, 3, 2284);
    			attr_dev(div5, "class", "legendSVG svelte-1tsaxfq");
    			add_location(div5, file, 50, 2, 2190);
    			add_location(strong4, file, 60, 25, 2387);
    			attr_dev(h21, "class", "svelte-1tsaxfq");
    			add_location(h21, file, 60, 2, 2364);
    			attr_dev(div6, "class", "desktop svelte-1tsaxfq");
    			add_location(div6, file, 63, 3, 2457);
    			attr_dev(div7, "class", "mobile svelte-1tsaxfq");
    			add_location(div7, file, 66, 3, 2523);
    			attr_dev(div8, "class", "legendSVG svelte-1tsaxfq");
    			add_location(div8, file, 62, 2, 2430);
    			attr_dev(div9, "class", "section1 svelte-1tsaxfq");
    			add_location(div9, file, 41, 1, 1088);
    			add_location(strong5, file, 74, 36, 2670);
    			attr_dev(h22, "class", "svelte-1tsaxfq");
    			add_location(h22, file, 74, 2, 2636);
    			attr_dev(div10, "class", "desktop svelte-1tsaxfq");
    			add_location(div10, file, 75, 2, 2735);
    			attr_dev(div11, "class", "mobile svelte-1tsaxfq");
    			add_location(div11, file, 79, 2, 2798);
    			add_location(p7, file, 82, 2, 2865);
    			add_location(strong6, file, 84, 20, 3097);
    			attr_dev(h23, "class", "svelte-1tsaxfq");
    			add_location(h23, file, 84, 2, 3079);
    			attr_dev(div12, "class", "desktop svelte-1tsaxfq");
    			add_location(div12, file, 86, 2, 3219);
    			attr_dev(div13, "class", "mobile svelte-1tsaxfq");
    			add_location(div13, file, 90, 2, 3284);
    			add_location(p8, file, 94, 2, 3354);
    			add_location(strong7, file, 96, 23, 3516);
    			attr_dev(h24, "class", "svelte-1tsaxfq");
    			add_location(h24, file, 96, 2, 3495);
    			attr_dev(a0, "href", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6052784/#CIT0021");
    			attr_dev(a0, "class", "svelte-1tsaxfq");
    			add_location(a0, file, 98, 33, 3650);
    			add_location(p9, file, 98, 2, 3619);
    			attr_dev(a1, "href", "https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01389/full");
    			attr_dev(a1, "class", "svelte-1tsaxfq");
    			add_location(a1, file, 100, 37, 3981);
    			add_location(p10, file, 100, 2, 3946);
    			attr_dev(a2, "href", "https://www.instagram.com/shani.chantel/?hl=en");
    			attr_dev(a2, "class", "svelte-1tsaxfq");
    			add_location(a2, file, 102, 60, 4370);
    			add_location(strong8, file, 102, 218, 4528);
    			add_location(p11, file, 102, 2, 4312);
    			add_location(p12, file, 104, 2, 4740);
    			add_location(strong9, file, 106, 68, 4913);
    			attr_dev(h25, "class", "svelte-1tsaxfq");
    			add_location(h25, file, 106, 2, 4847);
    			video.controls = true;
    			video.autoplay = true;
    			video.muted = true;
    			video.playsInline = true;
    			video.loop = true;
    			if (video.src !== (video_src_value = "build/assets/video-end_4.mp4")) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "poster", "build/assets/poster.jpg");
    			attr_dev(video, "class", "svelte-1tsaxfq");
    			add_location(video, file, 108, 2, 4969);
    			attr_dev(a3, "href", "https://www.linkedin.com/in/rebeccapazos");
    			attr_dev(a3, "class", "svelte-1tsaxfq");
    			add_location(a3, file, 113, 226, 5328);
    			attr_dev(a4, "href", "https://twitter.com/vivi_pazos");
    			attr_dev(a4, "class", "svelte-1tsaxfq");
    			add_location(a4, file, 113, 294, 5396);
    			attr_dev(p13, "class", "About svelte-1tsaxfq");
    			add_location(p13, file, 113, 2, 5104);
    			attr_dev(div14, "class", "section2 svelte-1tsaxfq");
    			add_location(div14, file, 73, 1, 2611);
    			attr_dev(main, "class", "svelte-1tsaxfq");
    			add_location(main, file, 34, 0, 879);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, style);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(inlinesvg0, div0, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(inlinesvg1, div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t5);
    			append_dev(div2, p0);
    			append_dev(div2, t7);
    			append_dev(div2, p1);
    			append_dev(main, t9);
    			append_dev(main, div9);
    			append_dev(div9, p2);
    			append_dev(div9, p3);
    			append_dev(div9, t12);
    			append_dev(div9, p4);
    			append_dev(p4, t13);
    			append_dev(p4, strong0);
    			append_dev(p4, t15);
    			append_dev(div9, t16);
    			append_dev(div9, p5);
    			append_dev(div9, t18);
    			append_dev(div9, p6);
    			append_dev(p6, t19);
    			append_dev(p6, strong1);
    			append_dev(p6, t21);
    			append_dev(p6, strong2);
    			append_dev(p6, t23);
    			append_dev(div9, t24);
    			append_dev(div9, h20);
    			append_dev(h20, t25);
    			append_dev(h20, strong3);
    			append_dev(h20, t27);
    			append_dev(div9, t28);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			mount_component(inlinesvg2, div3, null);
    			append_dev(div5, t29);
    			append_dev(div5, div4);
    			mount_component(inlinesvg3, div4, null);
    			append_dev(div9, t30);
    			append_dev(div9, h21);
    			append_dev(h21, t31);
    			append_dev(h21, strong4);
    			append_dev(h21, t33);
    			append_dev(div9, t34);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			mount_component(inlinesvg4, div6, null);
    			append_dev(div8, t35);
    			append_dev(div8, div7);
    			mount_component(inlinesvg5, div7, null);
    			append_dev(main, t36);
    			append_dev(main, div14);
    			append_dev(div14, h22);
    			append_dev(h22, t37);
    			append_dev(h22, strong5);
    			append_dev(h22, t39);
    			append_dev(div14, t40);
    			append_dev(div14, div10);
    			mount_component(inlinesvg6, div10, null);
    			append_dev(div14, t41);
    			append_dev(div14, div11);
    			mount_component(inlinesvg7, div11, null);
    			append_dev(div14, t42);
    			append_dev(div14, p7);
    			append_dev(div14, t44);
    			append_dev(div14, h23);
    			append_dev(h23, t45);
    			append_dev(h23, strong6);
    			append_dev(h23, t47);
    			append_dev(div14, t48);
    			append_dev(div14, div12);
    			mount_component(inlinesvg8, div12, null);
    			append_dev(div14, t49);
    			append_dev(div14, div13);
    			mount_component(inlinesvg9, div13, null);
    			append_dev(div14, t50);
    			append_dev(div14, p8);
    			append_dev(div14, t52);
    			append_dev(div14, h24);
    			append_dev(h24, t53);
    			append_dev(h24, strong7);
    			append_dev(h24, t55);
    			append_dev(div14, t56);
    			append_dev(div14, p9);
    			append_dev(p9, t57);
    			append_dev(p9, a0);
    			append_dev(p9, t59);
    			append_dev(div14, t60);
    			append_dev(div14, p10);
    			append_dev(p10, t61);
    			append_dev(p10, a1);
    			append_dev(p10, t63);
    			append_dev(div14, t64);
    			append_dev(div14, p11);
    			append_dev(p11, t65);
    			append_dev(p11, a2);
    			append_dev(p11, t67);
    			append_dev(p11, strong8);
    			append_dev(p11, t69);
    			append_dev(div14, t70);
    			append_dev(div14, p12);
    			append_dev(div14, t72);
    			append_dev(div14, h25);
    			append_dev(h25, t73);
    			append_dev(h25, strong9);
    			append_dev(div14, t75);
    			append_dev(div14, video);
    			append_dev(div14, t76);
    			append_dev(div14, p13);
    			append_dev(p13, t77);
    			append_dev(p13, a3);
    			append_dev(p13, t79);
    			append_dev(p13, a4);
    			append_dev(p13, t81);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inlinesvg0.$$.fragment, local);
    			transition_in(inlinesvg1.$$.fragment, local);
    			transition_in(inlinesvg2.$$.fragment, local);
    			transition_in(inlinesvg3.$$.fragment, local);
    			transition_in(inlinesvg4.$$.fragment, local);
    			transition_in(inlinesvg5.$$.fragment, local);
    			transition_in(inlinesvg6.$$.fragment, local);
    			transition_in(inlinesvg7.$$.fragment, local);
    			transition_in(inlinesvg8.$$.fragment, local);
    			transition_in(inlinesvg9.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inlinesvg0.$$.fragment, local);
    			transition_out(inlinesvg1.$$.fragment, local);
    			transition_out(inlinesvg2.$$.fragment, local);
    			transition_out(inlinesvg3.$$.fragment, local);
    			transition_out(inlinesvg4.$$.fragment, local);
    			transition_out(inlinesvg5.$$.fragment, local);
    			transition_out(inlinesvg6.$$.fragment, local);
    			transition_out(inlinesvg7.$$.fragment, local);
    			transition_out(inlinesvg8.$$.fragment, local);
    			transition_out(inlinesvg9.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(style);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			destroy_component(inlinesvg0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_component(inlinesvg1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(inlinesvg2);
    			destroy_component(inlinesvg3);
    			destroy_component(inlinesvg4);
    			destroy_component(inlinesvg5);
    			destroy_component(inlinesvg6);
    			destroy_component(inlinesvg7);
    			destroy_component(inlinesvg8);
    			destroy_component(inlinesvg9);
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

    const introDesktop = "build/assets/intro-desktop.svg";
    const happySVG = "build/assets/happy.svg";
    const angrySVG = "build/assets/angry.svg";
    const monthSVG = "build/assets/month.svg";
    const daySVG = "build/assets/day.svg";

    // mobile
    const introMobile = "build/assets/intro-mobile.svg";

    const happySVGmobile = "build/assets/happy-mobile.svg";
    const angrySVGmobile = "build/assets/angry-mobile.svg";
    const monthSVGmobile = "build/assets/month-mobile.svg";
    const daySVGmobile = "build/assets/day-mobile.svg";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		InlineSVG: Inline_svg,
    		introDesktop,
    		happySVG,
    		angrySVG,
    		monthSVG,
    		daySVG,
    		introMobile,
    		happySVGmobile,
    		angrySVGmobile,
    		monthSVGmobile,
    		daySVGmobile
    	});

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
