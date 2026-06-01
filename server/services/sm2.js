// SM-2: q = quality 0-5 (0-2 = fail, 3-5 = pass)
function sm2(entry, q) {
    let { ease, interval, reps } = entry;
    if (q >= 3) {
        interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease);
        reps += 1;
    } else {
        interval = 1;
        reps = 0;
    }
    ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    const due = new Date();
    due.setDate(due.getDate() + interval);
    return { ease, interval, reps, due };
}

module.exports = { sm2 };
