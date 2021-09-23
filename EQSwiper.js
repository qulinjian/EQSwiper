/**
 * EQSwiper v1.0.0 QuLinJian https://qulinjian.github.io/EQSwiper
 * License: MIT - http://mrgnrdrck.mit-license.org
 *
 * https://github.com/qulinjian/EQSwiper
 */

class EQSwiper {
	constructor({el, global, arrow, play, round}) {
		this.el = document.querySelector(el);
		this.global = Object.assign({
			width: "auto",
			height: "auto",
			initialSlide: 0,
			callback: () => {}
		},global);
		this.play = Object.assign({
			animate: true,
			autoPlay: true,
			speed: 1,
			delay: 8
		},play);
		this.arrow = Object.assign({
			show: true,
			size: 20,
			offset: 30,
			color: "rgba(0,0,0,.4)",
			innerCss: `position: absolute; z-index: 200;border-top: 0; border-left: 0; cursor: pointer; transform-origin: center;`,
			cssLeft: "",
			cssRight: ""
		},arrow);
		this.round = Object.assign({
			show: true,
			size: 14,
			offset: 18,
			color: 'rgba(0,0,0,.4)',
			activeColor: "rgb(255,255,255)",
			ele: [],
			innerCss: "margin: 0 8px;border-radius: 50%;cursor: pointer;",
			cssNormal: "",
			cssActive: ""
		},round);
		if(this.el) {   // 以下配置内部使用
			this.innerEle = null;
			this.timer = null;
			this.isAbled = true;
			this.oW = 0;
			this.originEle = [...(this.el.children)];
			this.len = this.originEle.length;
			this.init();  // 初始化
		} else {
			throw("未找到幻灯片元素");
		}
	}
	init() {
		this.createEle();   // 生成元素
		this.arrow.show && this.arrClick();   // 点击按钮
		this.round.show && this.roundClick();   // 点击圆点
		this.play.autoPlay && this.autoPlay();  // // 自动播放
	}
	// 生成元素结构
	createEle() {
		this.el.style.cssText = `${this.el.style.cssText};width: ${this.global.width + (isNaN(this.global.width) ? "" : "px")};height: ${this.global.height + (isNaN(this.global.height) ? "" : "px")};min-height: 50px;overflow: hidden;position: relative;`;
		this.el.innerHTML = "";  // 清空元素
		// 生成内部容器
		this.innerEle = this.ct("ul",{
			s: `display:flex;width: ${this.len * 100}%;margin: 0; padding: 0; list-style: none; position: relative; left: 0;`,
		});
		this.el.appendChild(this.innerEle);
		// 生成内部li
		this.originEle.forEach(item => {
			const _li = this.ct("li",{s: `flex: 1;align-items: center;`});
			_li.appendChild(item);
			this.innerEle.appendChild(_li);
			item.style.width = this.global.width + 'px';
			this.oW = isNaN(this.global.width) ? this.innerEle.offsetWidth / this.len : this.global.width;
			this.innerEle.style.transform = `translate(-${this.oW * this.global.initialSlide}px)`;
			window.addEventListener("resize",() => {
				this.oW = parseInt(getComputedStyle(item,false)["width"]);
				this.innerEle.style.transform = `translate(-${this.oW * this.global.initialSlide}px)`;
			});
		});
		this.arrow.show && this.resetArrow();  // 生成箭头
		// 生成圆点
		if(this.round.show) {
			this.resetRound();
			this.setRoundActive();
		}
	}
	// 生成箭头
	resetArrow() {
		const _size = this.arrow.size,_top = (parseInt(getComputedStyle(this.el)['height']) - this.arrow.size) / 2,_color = this.arrow.color,_offset = this.arrow.offset;
		this.leftBar = this.ct("div",{
			c: "eq-leftbar",
			s: `top: ${_top}px;width: ${_size}px;height: ${_size}px;left: ${_offset}px;  border: 8px solid ${_color};transform: rotate(135deg);` + this.arrow.innerCss + this.arrow.cssLeft
		});
		this.rightBar = this.ct("div",{
			c: "eq-rightbar",
			s: `top: ${_top}px;width: ${_size}px;height: ${_size}px;right: ${_offset}px;border: 8px solid ${_color}; transform: rotate(-45deg);` + this.arrow.innerCss + this.arrow.cssRight
		});
		this.el.appendChild(this.leftBar);
		this.el.appendChild(this.rightBar);
	}
	// 生成圆点
	resetRound() {
		const _ol = this.ct("ol",{
			c: "eq-swiper-rounds",
			s: `height: ${this.round.size}px;position: absolute;bottom: ${this.round.offset}px;display: flex;justify-content: center;width: 100%;margin: 0; padding: 0; list-style: none;`
		});
		this.el.appendChild(_ol);
		this.round.ele = [];
		this.originEle.forEach(item => {
			const _li = this.ct("li");
			this.round.ele.push(_li);
			_ol.appendChild(_li);
		});
	}
	// 生成单个元素
	ct(tagName,obj = {s: "",c: ""}) {
		const ele = document.createElement(tagName);
		const {s = "",c = ""} = obj;
		c && (ele.className = c);
		s && (ele.style.cssText = s);
		return ele;
	}
	// 播放
	toPlay() {
		const ele = this.innerEle;
		if(this.play.animate) {
			this.isAbled = false;
			ele.style.transition = `${this.play.speed}s transform`;
		}
		ele.style.transform = `translateX(-${this.oW * this.global.initialSlide}px)`;
		if(!this.play.animate) this.global.callback(this.global.initialSlide,this.originEle[this.global.initialSlide]);
		window.addEventListener("resize",() => {
			ele.style.transition = ``;
			ele.style.transform = `translateX(-${this.oW * this.global.initialSlide}px)`;
		});
		ele.addEventListener("webkitTransitionEnd", () => {
			this.isAbled = true;
			this.global.callback(this.global.initialSlide,this.originEle[this.global.initialSlide]);
		});
		this.round.show && this.setRoundActive();
	}
	// 自动播放
	autoPlay() {
		this.beginAutoPlay();
		this.el.addEventListener("mouseenter",() => this.stopAutoPlay());
		this.el.addEventListener("mouseleave",() => this.beginAutoPlay());
	}
	// 开始播放
	beginAutoPlay() {
		this.timer = setInterval(() => {
			this.global.initialSlide++;
			this.global.initialSlide %= this.len;
			this.toPlay();
		},(this.play.delay + this.play.speed) * 1000);
	}
	// 停止播放
	stopAutoPlay() {
		clearInterval(this.timer);
	}
	// 点击箭头
	arrClick() {
		this.leftBar.addEventListener("click", () => {
			if(this.isAbled) {
				this.global.initialSlide--;
				this.global.initialSlide = (this.global.initialSlide === -1) ? (this.len - 1) : this.global.initialSlide;
				this.toPlay();
			}
		});
		this.rightBar.addEventListener("click", () => {
			if(this.isAbled) {
				this.global.initialSlide++;
				this.global.initialSlide = (this.global.initialSlide === this.len) ? 0 : this.global.initialSlide;
				this.toPlay();
			}
		});
	}
	// 点击圆点
	roundClick() {
		this.round.ele.forEach((item,key) => {
			item.addEventListener("click",()=> {
				if(this.isAbled) {
					this.global.initialSlide = key;
					this.toPlay();
				}
			});
		});
	}
	// 设置圆点高亮
	setRoundActive() {
		const _size = this.round.size;
		this.round.ele.forEach((item,index) => {
			item.className = (index === this.global.initialSlide) ? "eq-swiper-round-active" : "eq-swiper-round-normal";
			item.style.cssText = this.round.innerCss + ((index === this.global.initialSlide) ? (`width: ${_size}px;height: ${_size}px;background: ${this.round.activeColor};cursor: default;` + this.round.cssActive) : (`width: ${_size}px;height: ${_size}px;background: ${this.round.color};` + this.round.cssNormal));
		});
	}
}