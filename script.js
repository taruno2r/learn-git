/* ==================================================================
   Learning Git: one GSAP timeline per concept.
   Each <figure data-scene="name"> gets a timeline from SCENES[name].
   Timelines play once when scrolled into view; "Replay" restarts them.
=================================================================== */
(function () {
    if (!window.gsap) return; // no GSAP: the SVGs show their final state

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const POP = { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2)' };

    /** Small helper kit bound to one SVG + caption + timeline. */
    function kit(svg, caption) {
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
        const q = (sel) => svg.querySelectorAll(sel);
        let lastCaption = caption.textContent;

        return {
            tl,
            q,
            /** Change the terminal caption at a point in the timeline. */
            say(text, pos) {
                lastCaption = text;
                tl.call(() => { caption.textContent = text; }, null, pos);
            },
            /** "Draw" a stroke from start to end. */
            draw(sel, pos, duration = 0.6) {
                q(sel).forEach((el, i) => {
                    const len = el.getTotalLength();
                    el.style.strokeDasharray = `${len} ${len + 10}`;
                    tl.fromTo(el,
                        { strokeDashoffset: len + 2 },
                        { strokeDashoffset: 0, duration, ease: 'power1.inOut' },
                        i === 0 ? pos : '<');
                });
            },
            /** Scale/fade elements in with a little overshoot. */
            pop(sel, pos, extra = {}) {
                tl.from(q(sel), { ...POP, ...extra }, pos);
            },
            /** Fade + rise elements in. */
            fade(sel, pos, extra = {}) {
                tl.from(q(sel), { opacity: 0, y: 10, duration: 0.4, ...extra }, pos);
            },
            /** Fade elements in from fully hidden (works for things that start hidden). */
            show(sel, pos, extra = {}) {
                tl.fromTo(q(sel), { opacity: 0 }, { opacity: 1, duration: 0.35, ...extra }, pos);
            },
            /** Quick "look here" pulse. */
            pulse(sel, pos) {
                tl.to(q(sel), { scale: 1.15, transformOrigin: '50% 50%', duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut' }, pos);
            },
            finalCaption: () => lastCaption,
        };
    }

    /** Arc a dot from where it is by (dx, dy), lifting by `lift` at mid-flight. */
    function arc(dx, dy, lift, duration = 0.9) {
        return {
            keyframes: [
                { x: dx / 2, y: dy / 2 - lift, duration: duration / 2, ease: 'power1.out' },
                { x: dx, y: dy, duration: duration / 2, ease: 'power1.in' },
            ],
        };
    }

    const SCENES = {

        /* 01 Repository ------------------------------------------------ */
        repo(s) {
            s.say('mkdir my-project && cd my-project', 0.01);
            s.tl.from(s.q('.folder'), { y: 20, opacity: 0, duration: 0.5 });
            s.pop('.file', '-=0.1', { stagger: 0.12 });
            s.fade('.file-name', '<', { stagger: 0.12 });

            s.say('git init', '+=0.4');
            s.pop('.gitbadge', '<', { rotation: -20 });
            s.fade('.lbl-local', '<0.2');

            s.say('git remote add origin https://github.com/you/my-project.git', '+=0.8');
            s.draw('.link', '<', 0.7);
            s.pop('.cloud-g', '-=0.15');

            s.say('git push -u origin main', '+=0.6');
            s.draw('.cloud-ln', '<', 0.45);
            s.pop('.cloud-c', '<', { stagger: 0.12 });
            s.fade('.lbl-remote', '<0.2');
        },

        /* 02 Clone ------------------------------------------------------ */
        clone(s) {
            s.say('# a repository lives on GitHub', 0.01);
            s.pop('.cloud-g', 0);
            s.draw('.src-ln', 0.25, 0.4);
            s.pop('.src', 0.25, { stagger: 0.08 });
            s.fade('.lbl-src', '<');
            s.tl.from(s.q('.laptop'), { opacity: 0, y: 20, duration: 0.5 }, '+=0.1');

            s.say('git clone https://github.com/you/my-project.git', '+=0.4');
            s.tl.from(s.q('.arrow'), { opacity: 0, x: -20, duration: 0.4 }, '<');
            s.tl.from(s.q('.copy'), { opacity: 0, duration: 0.01, stagger: 0.15 }, '+=0.1');
            s.tl.to(s.q('.copy'), { ...arc(330, 0, 60), stagger: 0.15 }, '<');
            s.draw('.dst-ln', '>-0.3', 0.4);

            s.say('cd my-project  # full history is here', '+=0.2');
            s.fade('.lbl-dst', '<');
        },

        /* 03 Branch ----------------------------------------------------- */
        branch(s) {
            s.say('git log --oneline  # on main', 0.01);
            s.draw('.m1', 0, 0.5);
            s.pop('.c1', 0);
            s.pop('.c2', 0.35);
            s.pop('.pill-main', 0.45);

            s.say('git switch -c feature/login', '+=0.5');
            s.draw('.br', '<', 0.6);

            s.say('git commit  # on feature/login', '+=0.1');
            s.pop('.f1', '<');
            s.pop('.pill-feat', '<0.1');

            s.say('# meanwhile, main keeps moving…', '+=0.6');
            s.draw('.m2', '<', 1.4);
            s.pop('.c3', '<0.65');
            s.tl.to(s.q('.pill-main'), { x: 200, duration: 0.6, ease: 'power2.inOut' }, '<');
            s.pop('.c4', '<0.7');
            s.tl.to(s.q('.pill-main'), { x: 320, duration: 0.5, ease: 'power2.inOut' }, '<');

            s.say('git commit  # more work, main is untouched', '+=0.2');
            s.pop('.f2', '<');
            s.tl.to(s.q('.pill-feat'), { x: 80, duration: 0.4 }, '<');
            s.pop('.f3', '+=0.3');
            s.tl.to(s.q('.pill-feat'), { x: 160, duration: 0.4 }, '<');
        },

        /* 04 Commit ----------------------------------------------------- */
        commit(s) {
            s.say('# edit some files', 0.01);
            s.fade('.zone', 0, { stagger: 0.1 });
            s.draw('.repo-ln', 0.3, 0.3);
            s.pop('.oldc', 0.3, { stagger: 0.1 });
            s.pop('.wfile', 0.4, { stagger: 0.12 });
            s.pop('.mbadge', '+=0.1', { stagger: 0.1 });

            s.say('git add index.html style.css', '+=0.6');
            s.tl.to(s.q('.wfile'), { x: 200, duration: 0.7, ease: 'power2.inOut', stagger: 0.12 }, '<');

            s.say('git commit -m "Add login form"', '+=0.6');
            s.tl.fromTo(s.q('.flash'), { opacity: 0 }, { opacity: 0.85, duration: 0.08, yoyo: true, repeat: 1 }, '<0.1');
            const [f1, f2] = s.q('.wfile');
            s.tl.to(f1, { x: 508, y: 68, scale: 0.15, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.05');
            s.tl.to(f2, { x: 446, y: 68, scale: 0.15, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<0.08');
            s.draw('.repo-ln2', '>-0.2', 0.25);
            s.pop('.newc', '>-0.05', { ease: 'back.out(3)' });
            s.pop('.bubble', '+=0.1');
        },

        /* 05 Push / Pull ------------------------------------------------ */
        pushpull(s) {
            s.say('git commit -m "Add login form"  # local only', 0.01);
            s.tl.from(s.q('.laptop, .cloud-g, .lbl'), { opacity: 0, y: 12, duration: 0.4, stagger: 0.08 }, 0);
            s.draw('.base-ln', 0.3, 0.4);
            s.pop('.base', 0.3, { stagger: 0.05 });
            s.draw('.l-ext1', '+=0.2', 0.25);
            s.pop('.local-new', '<');

            s.say('git push origin main', '+=0.6');
            s.fade('.arrow-push', '<');
            s.tl.from(s.q('.push-dot'), { opacity: 0, duration: 0.01 }, '<0.2');
            s.tl.to(s.q('.push-dot'), arc(360, -2, 50, 1), '<');
            s.draw('.c-ext1', '>-0.2', 0.25);

            s.say('# a teammate pushes their own commit', '+=0.5');
            s.draw('.c-ext2', '<', 0.25);
            s.pop('.team-remote', '<');

            s.say('git pull origin main', '+=0.8');
            s.fade('.arrow-pull', '<', { y: -10 });
            s.tl.from(s.q('.pull-dot'), { opacity: 0, duration: 0.01 }, '<0.2');
            s.tl.to(s.q('.pull-dot'), arc(-360, 2, -50, 1), '<');
            s.draw('.l-ext2', '>-0.2', 0.25);

            s.say('git status  # up to date with origin/main ✓', '+=0.3');
        },

        /* 06 Diff ------------------------------------------------------- */
        diff(s) {
            s.say('git diff main feature/login', 0.01);
            s.fade('.panel-l', 0);
            s.fade('.panel-r', 0.15);
            s.fade('.code-l', 0.35, { y: 0, x: -6, stagger: 0.06 });
            s.fade('.code-r', 0.45, { y: 0, x: -6, stagger: 0.06 });

            s.say('# − lines only in main, + lines only in feature/login', '+=0.3');
            s.tl.from(s.q('.hl'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, stagger: 0.3 }, '<');
            s.pop('.mk', '<', { stagger: 0.3 });
            s.fade('.summary', '+=0.3');
        },

        /* 07 Merge ------------------------------------------------------ */
        merge(s) {
            s.say('# feature/login is ready', 0.01);
            s.draw('.m1', 0, 0.6);
            s.pop('.cm', 0.05, { stagger: 0.18 });
            s.draw('.br', 0.35, 0.5);
            s.pop('.cf', 0.65, { stagger: 0.18 });
            s.pop('.pill-main', 0.6);
            s.pop('.pill-feat', 0.9);

            s.say('git switch main', '+=0.5');
            s.pulse('.pill-main', '<');

            s.say('git merge feature/login', '+=0.7');
            s.draw('.mg', '<', 0.7);
            s.draw('.m2', '<', 0.7);
            s.tl.to(s.q('.pill-main'), { x: 170, duration: 0.7, ease: 'power2.inOut' }, '<');
            s.pop('.mc', '>-0.1', { ease: 'back.out(3)' });
            s.tl.from(s.q('.ring'), { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', duration: 0.5 }, '<');
            s.fade('.mlabel', '<0.2');

            s.say('git branch -d feature/login  # tidy up', '+=0.6');
        },

        /* 08 Rebase ----------------------------------------------------- */
        rebase(s) {
            s.say('# feature started from c1', 0.01);
            s.draw('.m1', 0, 0.5);
            s.pop('.cm', 0.05, { stagger: 0.15 });
            s.pop('.pill-main', 0.3);
            s.draw('.old', 0.3, 0.5);
            s.pop('.oldc', 0.6, { stagger: 0.12 });
            s.pop('.pill-feat', 0.9);

            s.say('# meanwhile, main gained c3', '+=0.5');
            s.draw('.m2', '<', 0.4);
            s.pop('.c3', '>-0.1');
            s.tl.to(s.q('.pill-main'), { x: 120, duration: 0.5, ease: 'power2.inOut' }, '<');

            s.say('git switch feature/login', '+=0.6');
            s.pulse('.pill-feat', '<');

            s.say('git rebase main', '+=0.6');
            s.tl.set(s.q('.old'), { strokeDasharray: '6 8', strokeDashoffset: 0 }, '<');
            s.tl.to(s.q('.old, .oldc'), { opacity: 0.22, duration: 0.4 }, '<');
            s.draw('.nw', '<0.1', 0.6);
            s.tl.from(s.q('.cp'), { opacity: 0, duration: 0.01 }, '<');
            s.tl.to(s.q('.cp'), { ...arc(240, 0, 40, 0.9), stagger: 0.18 }, '<');
            s.tl.to(s.q('.pill-feat'), { x: 240, duration: 0.9, ease: 'power2.inOut' }, '<0.2');
            s.pop('.newl', '>-0.2', { stagger: 0.15 });

            s.say('# straight line: c1 → c2 → c3 → A′ → B′', '+=0.3');
        },

        /* 09 Merge conflict -------------------------------------------- */
        conflict(s) {
            s.say('git merge feature/login', 0.01);
            s.fade('.card', 0, { x: -10, y: 0, stagger: 0.15 });
            s.fade('.file-g', 0.2, { x: 10, y: 0 });
            // The content of the file starts hidden; it is revealed below.
            gsap.set(s.q('.file-g .hl, .file-g .mark, .ours, .theirs, .alert, .st-bad, .st-ok'), { opacity: 0 });

            // Both edits head for the same line…
            s.tl.from(s.q('.fly'), { opacity: 0, duration: 0.01 }, '+=0.3');
            const [flyMain, flyFeat] = s.q('.fly');
            s.tl.to(flyMain, { ...arc(254, 16, 20, 0.8) }, '<');
            s.tl.to(flyFeat, { ...arc(254, -52, 20, 0.8) }, '<');
            s.tl.to(s.q('.fly'), { opacity: 0, duration: 0.15 }, '>');

            s.say('# CONFLICT: both branches changed line 1', '<');
            s.tl.to(s.q('.ours, .theirs, .ours-bg, .theirs-bg, .mark'), { opacity: 1, duration: 0.3, stagger: 0.05 }, '<');
            s.tl.to(s.q('.alert, .st-bad'), { opacity: 1, duration: 0.2 }, '<0.2');
            s.tl.to(s.q('.file-g'), { keyframes: { x: [0, -7, 7, -5, 5, -2, 0] }, duration: 0.5, ease: 'none' }, '<');

            s.say('# you choose: keep "Hello there", delete the markers', '+=1.1');
            s.pulse('.theirs', '<');
            s.tl.to(s.q('.mark, .ours, .ours-bg'), { opacity: 0, duration: 0.35 }, '+=0.3');
            s.tl.to(s.q('.theirs, .theirs-bg'), { y: -72, duration: 0.6, ease: 'power2.inOut' }, '>-0.1');
            s.tl.to(s.q('.hl-ok'), { opacity: 1, duration: 0.3 }, '>-0.1');
            s.tl.to(s.q('.theirs-bg'), { opacity: 0, duration: 0.3 }, '<');
            s.tl.to(s.q('.alert, .st-bad'), { opacity: 0, duration: 0.25 }, '<');
            s.tl.to(s.q('.st-ok'), { opacity: 1, duration: 0.3 }, '>');

            s.say('git add index.html && git commit', '<');
        },

        /* 10 Pull Request ---------------------------------------------- */
        pr(s) {
            s.say('git push -u origin feature/login && gh pr create', 0.01);
            s.fade('.card-bg', 0, { y: 0 });
            gsap.set(s.q('.pill-merged, .chk-ok, .btn-on, .merged-note'), { opacity: 0 });
            s.pop('.pill-open', 0.2);
            s.fade('.pr-title, .pr-meta', 0.3, { stagger: 0.1 });

            s.say('# a reviewer leaves a comment', '+=0.5');
            s.fade('.row1', '<', { x: -10, y: 0 });

            s.say('git commit -am "Rename btn" && git push', '+=0.9');
            s.fade('.row2', '<', { x: -10, y: 0 });

            s.say('# checks run on every push', '+=0.7');
            s.pop('.chk-pend', '<');
            s.fade('.chk-text', '<');
            s.tl.to(s.q('.chk-pend'), { rotation: 360, transformOrigin: '50% 50%', duration: 0.8, repeat: 1, ease: 'none' }, '<');
            s.tl.to(s.q('.chk-pend'), { opacity: 0, duration: 0.15 }, '>');
            s.tl.fromTo(s.q('.chk-ok'), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, '<');

            s.say('# approved ✓', '+=0.3');
            s.fade('.appr', '<', { x: -10, y: 0 });
            s.tl.to(s.q('.btn-on'), { opacity: 1, duration: 0.3 }, '<0.2');

            s.say('gh pr merge  # or click "Merge pull request"', '+=0.7');
            s.tl.to(s.q('.btn'), { scale: 0.93, transformOrigin: '50% 50%', duration: 0.1, yoyo: true, repeat: 1 }, '<0.3');
            s.tl.to(s.q('.pill-open'), { opacity: 0, duration: 0.25 }, '>');
            s.tl.fromTo(s.q('.pill-merged'), { scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<');
            s.tl.to(s.q('.merged-note'), { opacity: 1, duration: 0.3 }, '<0.1');
        },

        /* 11 Issue ------------------------------------------------------ */
        issue(s) {
            s.say('gh issue create --title "Safari: Log in button does nothing"', 0.01);
            s.fade('.card-bg', 0, { y: 0 });
            gsap.set(s.q('.pill-closed, .closed-note'), { opacity: 0 });
            s.pop('.pill-open', 0.2);
            s.fade('.is-title', 0.3);

            s.say('# what kind of ticket is it?', '+=0.4');
            s.fade('.chips-lbl', '<');
            s.pop('.chip', '<', { stagger: 0.12 });
            s.tl.to(s.q('.chip-other'), { opacity: 0.25, duration: 0.3 }, '+=0.4');
            s.pulse('.chip-bug', '<');
            s.fade('.body-ln', '+=0.1', { stagger: 0.15 });

            s.say('gh issue edit 42 --add-assignee alex', '+=0.6');
            s.fade('.asg', '<', { x: -10, y: 0 });

            s.say('git commit -m "Fix Safari login (fixes #42)"', '+=0.8');
            s.fade('.link-pr', '<', { x: -10, y: 0 });

            s.say('# PR merged → issue closes automatically', '+=0.8');
            s.tl.to(s.q('.pill-open'), { opacity: 0, duration: 0.25 }, '<');
            s.tl.fromTo(s.q('.pill-closed'), { scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<');
            s.tl.to(s.q('.closed-note'), { opacity: 1, duration: 0.3 }, '<0.1');
        },
    };

    document.querySelectorAll('.viz[data-scene]').forEach((fig) => {
        const build = SCENES[fig.dataset.scene];
        if (!build) return;

        const svg = fig.querySelector('svg');
        const caption = fig.querySelector('.cmd');
        const s = kit(svg, caption);
        build(s);

        const replay = fig.querySelector('.replay');
        replay.addEventListener('click', () => s.tl.restart());

        if (reduceMotion) {
            // No motion: jump to the finished picture; Replay still steps through it.
            s.tl.progress(1);
            caption.textContent = s.finalCaption();
            return;
        }

        ScrollTrigger.create({
            trigger: fig,
            start: 'top 50%', // the stage is full-screen: wait until it's mostly in view
            once: true,
            onEnter: () => s.tl.play(),
        });
    });
})();
