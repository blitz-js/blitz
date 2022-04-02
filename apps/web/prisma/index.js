"use strict"
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k]
          },
        })
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p)
  }
exports.__esModule = true
exports.prisma = void 0
var blitz_1 = require("blitz")
var client_1 = require("@prisma/client")
var EnhancedPrisma = (0, blitz_1.enhancePrisma)(client_1.PrismaClient)
__exportStar(require("@prisma/client"), exports)
var prisma = new EnhancedPrisma()
exports.prisma = prisma
