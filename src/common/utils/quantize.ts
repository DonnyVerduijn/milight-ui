/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable prettier/prettier */

// if (!pv) {
var pv = {
  // @ts-expect-error any parameters
  map: function (array, f) {
    var o: Record<string, unknown> = {};

    return f
      ? // @ts-expect-error any parameters
        array.map(function (d, i) {
          o.index = i;
          return f.call(o, d);
        })
      : array.slice();
  },
  // @ts-expect-error any parameters
  naturalOrder: function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  },
  // @ts-expect-error any parameters
  sum: function (array, f) {
    var o: Record<string, unknown> = {};

    return array.reduce(
      f
        ? // @ts-expect-error any parameters
          function (p, d, i) {
            o.index = i;
            return p + f.call(o, d);
          }
        : // @ts-expect-error any parameters
          function (p, d) {
            return p + d;
          },
      0
    );
  },
  // @ts-expect-error any parameters
  max: function (array, f) {
    return Math.max.apply(null, f ? pv.map(array, f) : array);
  },
};
// }

var MMCQ = (function () {
  // private constants
  var sigbits = 5,
    rshift = 8 - sigbits,
    maxIterations = 1000,
    fractByPopulations = 0.75;

  // get reduced-space color index for a pixel

  // @ts-expect-error any parameters
  function getColorIndex(r, g, b) {
    return (r << (2 * sigbits)) + (g << sigbits) + b;
  }

  // Simple priority queue
  // @ts-expect-error any parameters
  function PQueue(comparator) {
    // @ts-expect-error implicit any
    var contents = [],
      sorted = false;

    function sort() {
      // @ts-expect-error implicit any
      contents.sort(comparator);
      sorted = true;
    }

    return {
      // @ts-expect-error any parameters
      push: function (o) {
        contents.push(o);
        sorted = false;
      },
      // @ts-expect-error any parameters
      peek: function (index) {
        if (!sorted) sort();
        if (index === undefined) index = contents.length - 1;
        // @ts-expect-error implicit any
        return contents[index];
      },
      pop: function () {
        if (!sorted) sort();
        // @ts-expect-error implicit any
        return contents.pop();
      },
      size: function () {
        return contents.length;
      },
      // @ts-expect-error any parameters
      map: function (f) {
        // @ts-expect-error implicit any
        return contents.map(f);
      },
      debug: function () {
        if (!sorted) sort();
        // @ts-expect-error implicit any
        return contents;
      },
    };
  }

  // 3d color space box

  // @ts-expect-error any parameters
  function VBox(r1, r2, g1, g2, b1, b2, histo) {
    // @ts-expect-error implicit any
    var vbox = this;
    vbox.r1 = r1;
    vbox.r2 = r2;
    vbox.g1 = g1;
    vbox.g2 = g2;
    vbox.b1 = b1;
    vbox.b2 = b2;
    vbox.histo = histo;
  }
  VBox.prototype = {
    // @ts-expect-error any parameters
    volume: function (force) {
      var vbox = this;
      if (!vbox._volume || force) {
        vbox._volume =
          (vbox.r2 - vbox.r1 + 1) *
          (vbox.g2 - vbox.g1 + 1) *
          (vbox.b2 - vbox.b1 + 1);
      }
      return vbox._volume;
    },
    // @ts-expect-error any parameters
    count: function (force) {
      var vbox = this,
        histo = vbox.histo;
      if (!vbox._count_set || force) {
        var npix = 0,
          i,
          j,
          k,
          index;
        for (i = vbox.r1; i <= vbox.r2; i++) {
          for (j = vbox.g1; j <= vbox.g2; j++) {
            for (k = vbox.b1; k <= vbox.b2; k++) {
              index = getColorIndex(i, j, k);
              npix += histo[index] || 0;
            }
          }
        }
        vbox._count = npix;
        vbox._count_set = true;
      }
      return vbox._count;
    },
    copy: function () {
      var vbox = this;
      // @ts-expect-error any return type
      return new VBox(
        vbox.r1,
        vbox.r2,
        vbox.g1,
        vbox.g2,
        vbox.b1,
        vbox.b2,
        vbox.histo
      );
    },
    // @ts-expect-error any parameters
    avg: function (force) {
      var vbox = this,
        histo = vbox.histo;
      if (!vbox._avg || force) {
        var ntot = 0,
          mult = 1 << (8 - sigbits),
          rsum = 0,
          gsum = 0,
          bsum = 0,
          hval,
          i,
          j,
          k,
          histoindex;
        for (i = vbox.r1; i <= vbox.r2; i++) {
          for (j = vbox.g1; j <= vbox.g2; j++) {
            for (k = vbox.b1; k <= vbox.b2; k++) {
              histoindex = getColorIndex(i, j, k);
              hval = histo[histoindex] || 0;
              ntot += hval;
              rsum += hval * (i + 0.5) * mult;
              gsum += hval * (j + 0.5) * mult;
              bsum += hval * (k + 0.5) * mult;
            }
          }
        }
        if (ntot) {
          vbox._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
        } else {
          //console.log('empty box');
          vbox._avg = [
            ~~((mult * (vbox.r1 + vbox.r2 + 1)) / 2),
            ~~((mult * (vbox.g1 + vbox.g2 + 1)) / 2),
            ~~((mult * (vbox.b1 + vbox.b2 + 1)) / 2),
          ];
        }
      }
      return vbox._avg;
    },
    // @ts-expect-error any parameters
    contains: function (pixel) {
      var vbox = this,
        rval = pixel[0] >> rshift;
      // @ts-expect-error cannot find gval
      gval = pixel[1] >> rshift;
      // @ts-expect-error cannot find bval
      bval = pixel[2] >> rshift;
      return (
        rval >= vbox.r1 &&
        rval <= vbox.r2 &&
        // @ts-expect-error cannot find gval
        gval >= vbox.g1 &&
        // @ts-expect-error cannot find gval
        gval <= vbox.g2 &&
        // @ts-expect-error cannot find bval
        bval >= vbox.b1 &&
        // @ts-expect-error cannot find bval
        bval <= vbox.b2
      );
    },
  };

  // Color map

  function CMap() {
    // @ts-expect-error only void function can be called with new keyword
    this.vboxes = new PQueue(function (a, b) {
      return pv.naturalOrder(
        a.vbox.count() * a.vbox.volume(),
        b.vbox.count() * b.vbox.volume()
      );
    });
  }
  CMap.prototype = {
    // @ts-expect-error any parameters
    push: function (vbox) {
      this.vboxes.push({
        vbox: vbox,
        color: vbox.avg(),
      });
    },
    palette: function () {
      // @ts-expect-error any parameters
      return this.vboxes.map(function (vb) {
        return vb.color;
      });
    },
    size: function () {
      return this.vboxes.size();
    },
    // @ts-expect-error any parameters
    map: function (color) {
      var vboxes = this.vboxes;
      for (var i = 0; i < vboxes.size(); i++) {
        if (vboxes.peek(i).vbox.contains(color)) {
          return vboxes.peek(i).color;
        }
      }
      return this.nearest(color);
    },
    // @ts-expect-error any parameters
    nearest: function (color) {
      var vboxes = this.vboxes,
        d1,
        d2,
        pColor;
      for (var i = 0; i < vboxes.size(); i++) {
        d2 = Math.sqrt(
          Math.pow(color[0] - vboxes.peek(i).color[0], 2) +
            Math.pow(color[1] - vboxes.peek(i).color[1], 2) +
            Math.pow(color[2] - vboxes.peek(i).color[2], 2)
        );
        // @ts-expect-error possibly undefined
        if (d2 < d1 || d1 === undefined) {
          d1 = d2;
          pColor = vboxes.peek(i).color;
        }
      }
      return pColor;
    },
    forcebw: function () {
      // XXX: won't  work yet
      var vboxes = this.vboxes;
      // @ts-expect-error any parameters
      vboxes.sort(function (a, b) {
        // @ts-expect-error not enough arguments
        return pv.naturalOrder(pv.sum(a.color), pv.sum(b.color));
      });

      // force darkest color to black if everything < 5
      var lowest = vboxes[0].color;
      if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5)
        vboxes[0].color = [0, 0, 0];

      // force lightest color to white if everything > 251
      var idx = vboxes.length - 1,
        highest = vboxes[idx].color;
      if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251)
        vboxes[idx].color = [255, 255, 255];
    },
  };

  // histo (1-d array, giving the number of pixels in
  // each quantized region of color space), or null on error

  // @ts-expect-error any parameters
  function getHisto(pixels) {
    var histosize = 1 << (3 * sigbits),
      histo = new Array(histosize),
      index,
      rval,
      gval,
      bval;
    // @ts-expect-error any parameters
    pixels.forEach(function (pixel) {
      rval = pixel[0] >> rshift;
      gval = pixel[1] >> rshift;
      bval = pixel[2] >> rshift;
      index = getColorIndex(rval, gval, bval);
      histo[index] = (histo[index] || 0) + 1;
    });
    return histo;
  }

  // @ts-expect-error any parameters
  function vboxFromPixels(pixels, histo) {
    var rmin = 1000000,
      rmax = 0,
      gmin = 1000000,
      gmax = 0,
      bmin = 1000000,
      bmax = 0,
      rval,
      gval,
      bval;
    // find min/max
    // @ts-expect-error any parameters
    pixels.forEach(function (pixel) {
      rval = pixel[0] >> rshift;
      gval = pixel[1] >> rshift;
      bval = pixel[2] >> rshift;
      if (rval < rmin) rmin = rval;
      else if (rval > rmax) rmax = rval;
      if (gval < gmin) gmin = gval;
      else if (gval > gmax) gmax = gval;
      if (bval < bmin) bmin = bval;
      else if (bval > bmax) bmax = bval;
    });
    // @ts-expect-error any return type
    return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
  }

  // @ts-expect-error any type
  function medianCutApply(histo, vbox) {
    if (!vbox.count()) return;

    var rw = vbox.r2 - vbox.r1 + 1,
      gw = vbox.g2 - vbox.g1 + 1,
      bw = vbox.b2 - vbox.b1 + 1,
      // @ts-expect-error not enough arguments
      maxw = pv.max([rw, gw, bw]);
    // only one pixel, no split
    if (vbox.count() == 1) {
      return [vbox.copy()];
    }
    /* Find the partial sum arrays along the selected axis. */
    var total = 0,
      // @ts-expect-error implicit any
      partialsum = [],
      // @ts-expect-error implicit any
      lookaheadsum = [],
      i,
      j,
      k,
      sum,
      index;
    if (maxw == rw) {
      for (i = vbox.r1; i <= vbox.r2; i++) {
        sum = 0;
        for (j = vbox.g1; j <= vbox.g2; j++) {
          for (k = vbox.b1; k <= vbox.b2; k++) {
            index = getColorIndex(i, j, k);
            sum += histo[index] || 0;
          }
        }
        total += sum;
        partialsum[i] = total;
      }
    } else if (maxw == gw) {
      for (i = vbox.g1; i <= vbox.g2; i++) {
        sum = 0;
        for (j = vbox.r1; j <= vbox.r2; j++) {
          for (k = vbox.b1; k <= vbox.b2; k++) {
            index = getColorIndex(j, i, k);
            sum += histo[index] || 0;
          }
        }
        total += sum;
        partialsum[i] = total;
      }
    } else {
      /* maxw == bw */
      for (i = vbox.b1; i <= vbox.b2; i++) {
        sum = 0;
        for (j = vbox.r1; j <= vbox.r2; j++) {
          for (k = vbox.g1; k <= vbox.g2; k++) {
            index = getColorIndex(j, k, i);
            sum += histo[index] || 0;
          }
        }
        total += sum;
        partialsum[i] = total;
      }
    }
    partialsum.forEach(function (d, i) {
      lookaheadsum[i] = total - d;
    });

    // @ts-expect-error any parameters
    function doCut(color) {
      var dim1 = color + '1',
        dim2 = color + '2',
        left,
        right,
        vbox1,
        vbox2,
        d2,
        count2 = 0;
      for (i = vbox[dim1]; i <= vbox[dim2]; i++) {
        // @ts-expect-error implicit any
        if (partialsum[i] > total / 2) {
          vbox1 = vbox.copy();
          vbox2 = vbox.copy();
          left = i - vbox[dim1];
          right = vbox[dim2] - i;
          if (left <= right) d2 = Math.min(vbox[dim2] - 1, ~~(i + right / 2));
          else d2 = Math.max(vbox[dim1], ~~(i - 1 - left / 2));
          // avoid 0-count boxes
          // @ts-expect-error implicit any
          while (!partialsum[d2]) d2++;
          // @ts-expect-error implicit any
          count2 = lookaheadsum[d2];
          // @ts-expect-error implicit any
          while (!count2 && partialsum[d2 - 1]) count2 = lookaheadsum[--d2];
          // set dimensions
          vbox1[dim2] = d2;
          vbox2[dim1] = vbox1[dim2] + 1;
          // console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
          return [vbox1, vbox2];
        }
      }
    }
    // determine the cut planes
    return maxw == rw ? doCut('r') : maxw == gw ? doCut('g') : doCut('b');
  }

  // @ts-expect-error any parameters
  function quantize(pixels, maxcolors) {
    // short-circuit
    if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
      // console.log('wrong number of maxcolors');
      return false;
    }

    // XXX: check color content and convert to grayscale if insufficient

    var histo = getHisto(pixels),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      histosize = 1 << (3 * sigbits);

    // check that we aren't below maxcolors already
    var nColors = 0;
    histo.forEach(function () {
      nColors++;
    });
    if (nColors <= maxcolors) {
      // XXX: generate the new colors from the histo and return
    }

    // get the beginning vbox from the colors
    var vbox = vboxFromPixels(pixels, histo),
      // @ts-expect-error only void function can be called with new keyword
      pq = new PQueue(function (a, b) {
        return pv.naturalOrder(a.count(), b.count());
      });
    pq.push(vbox);

    // inner function to do the iteration

    // @ts-expect-error has any type
    function iter(lh, target) {
      var ncolors = lh.size(),
        niters = 0,
        vbox;
      while (niters < maxIterations) {
        if (ncolors >= target) return;
        if (niters++ > maxIterations) {
          // console.log("infinite loop; perhaps too few pixels!");
          return;
        }
        vbox = lh.pop();
        if (!vbox.count()) {
          /* just put it back */
          lh.push(vbox);
          niters++;
          continue;
        }
        // do the cut

        var vboxes = medianCutApply(histo, vbox),
          // @ts-expect-error vboxes possibly undefined
          vbox1 = vboxes[0],
          // @ts-expect-error vboxes possibly undefined
          vbox2 = vboxes[1];

        if (!vbox1) {
          // console.log("vbox1 not defined; shouldn't happen!");
          return;
        }
        lh.push(vbox1);
        if (vbox2) {
          /* vbox2 can be null */
          lh.push(vbox2);
          ncolors++;
        }
      }
    }

    // first set of colors, sorted by population
    iter(pq, fractByPopulations * maxcolors);
    // console.log(pq.size(), pq.debug().length, pq.debug().slice());

    // Re-sort by the product of pixel occupancy times the size in color space.
    // @ts-expect-error only void function can be called with new keyword
    var pq2 = new PQueue(function (a, b) {
      return pv.naturalOrder(a.count() * a.volume(), b.count() * b.volume());
    });
    while (pq.size()) {
      pq2.push(pq.pop());
    }

    // next set - generate the median cuts using the (npix * vol) sorting.
    iter(pq2, maxcolors);

    // calculate the actual colors
    // @ts-expect-error has any type
    var cmap = new CMap();
    while (pq2.size()) {
      cmap.push(pq2.pop());
    }

    return cmap;
  }

  return {
    quantize: quantize,
  };
})();

export default MMCQ.quantize;

/* eslint-enable sort-keys-fix/sort-keys-fix */
/* eslint-enable @typescript-eslint/restrict-plus-operands */
/* eslint-enable @typescript-eslint/no-unsafe-argument */
/* eslint-enable @typescript-eslint/no-this-alias */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable no-var */
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-return */

/* eslint-enable @typescript-eslint/ban-ts-comment */
