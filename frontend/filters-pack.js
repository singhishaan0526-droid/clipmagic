/*!
 * Clip Magic — Filter Pack (20 Fitted Instagram-style filters)
 *
 * Fitted polynomial coefficients & WebGL FilterRenderer:
 *   - 27-term polynomial color curve, radial vignette & multiscale blur/contrast basis
 *   - WebGL shader pipeline with hardware acceleration & real-time preview
 *   - Video & image processing with MediaRecorder WebM / PNG direct export
 *   - Parity with CSS preview filter string & FFmpeg filter_complex segments
 *
 * clip.filter = '<id>' and clip.filterAmount = 0..100 (strength, default 100).
 */
(function (root) {
  'use strict';

  const DEFS = [{"id":"toxic-glitch","name":"Toxic Glitch","css":"brightness(.8) contrast(.8) saturate(.7) sepia(.2) hue-rotate(35deg)","layers":[{"t":"tint","color":"#0a6b5a","blend":"soft-light","a":0.45},{"t":"split","dx":0.006,"a":0.35},{"t":"vignette","s":0.45}],"w":[-0.0058,0.9461,-0.4628,0.2187,0.034,-0.3621,-0.0984,0.6117,-0.9396,0.834,0.0459,-0.1439,0.0291,0.0708,0.3393,-0.1433,0.0727,0.0382,0.0337,-0.0678,0.0206,-0.0867,0.092,0,0,0,0,0.0025,0.2285,0.1017,0.3348,-0.2117,-0.0322,0.1,0.7476,-0.3971,-0.1206,0.0333,0.0147,-0.0731,0.0375,0.1177,0.099,0.0398,-0.0725,0.0921,-0.0702,0.0461,-0.0702,0.0451,0,0,0,0,0.0238,0.038,0.1025,0.436,-0.1815,0.5061,0.062,0.1498,0.1742,-0.59,0.0298,0.0845,-0.1475,0.0443,0.1186,0.0836,0.0617,-0.2269,0.118,0.0189,0.0442,-0.0619,0.0256,0,0,0,0],"fx":"glitch"},{"id":"low-light","name":"Low Light+","css":"brightness(.84) contrast(.92) saturate(1.05) hue-rotate(-4deg)","layers":[{"t":"tint","color":"#4a5a80","blend":"soft-light","a":0.25}],"w":[0.0491,0.6172,-0.0171,-0.048,0.0025,0.0774,-0.0066,0.1124,-0.0385,0.0169,-0.013,-0.0863,0.1128,-0.0061,0.0111,0.016,-0.0204,-0.0884,0.0535,0.0309,-0.0527,0.067,-0.016,0,0,0,0,0.0434,-0.058,0.6686,-0.1128,0.0271,0.1348,0.0882,0.0258,-0.1784,0.1141,-0.0066,-0.0046,-0.0007,0.0139,-0.0546,0.0914,-0.0427,0.0457,-0.0734,0.0303,-0.0547,0.081,-0.0286,0,0,0,0,0.0385,-0.029,-0.0839,0.6729,-0.0515,-0.2753,0.0527,0.3869,-0.4342,0.4991,-0.0103,-0.0566,0.0746,-0.0026,0.0062,-0.0188,0.0192,0.0674,0.0284,-0.0939,-0.0359,0.0559,-0.0175,0,0,0,0]},{"id":"view-hd","name":"View HD","css":"brightness(1.02) contrast(1.06) saturate(1.15)","layers":[],"w":[0.0188,1.4138,-0.1965,-0.2092,-0.5408,-0.405,-0.7894,0.2512,0.85,0.5769,-0.0048,0.0994,-0.1305,0.0119,0.3222,-0.2334,-0.0776,-0.2501,0.1771,0.0711,0.0045,0.0184,-0.0217,0,0,0,0,0.0175,0.0413,1.31,-0.292,-0.1602,-1.0032,-0.3789,0.6919,-0.0844,0.8308,-0.0042,0.0748,-0.112,0.0376,0.1683,-0.0519,-0.1058,-0.0536,-0.0151,0.0653,0.0178,0.0161,-0.0331,0,0,0,0,0.0277,0.1112,-0.2601,1.1972,-0.186,-1.2831,-0.0744,1.4895,-0.8743,0.8272,-0.0236,-0.0237,0.0652,-0.002,0.2807,-0.2007,-0.0502,0.0372,0.0209,-0.0732,-0.0019,-0.0034,-0.0019,0,0,0,0]},{"id":"aesthetic-brown","name":"Aesthetic Brown","css":"brightness(1.1) contrast(.95) saturate(1.4) sepia(.25) hue-rotate(-8deg)","layers":[{"t":"tint","color":"#7a5030","blend":"soft-light","a":0.35},{"t":"vignette","s":0.3}],"w":[0.1254,0.3246,0.2398,-0.0149,0.7319,-0.8325,0.0764,0.5638,-1.2425,0.9429,-0.0102,0.0043,-0.03,0.0231,0.0575,-0.1013,-0.0013,-0.0843,0.0533,0.0337,-0.0493,0.0804,-0.0354,0,0,0,0,0.1101,-0.0619,0.5548,0.0172,-0.1194,-0.166,-0.062,0.6756,-0.0466,0.0253,-0.0008,0.0344,-0.053,0.0211,0.0257,0.0063,-0.048,0.0146,-0.0521,0.0396,-0.0203,0.0557,-0.0375,0,0,0,0,-0.0745,-0.018,0.1956,0.6875,0.5075,-0.4408,0.4799,0.5042,-1.3613,0.5525,0.0164,-0.0039,-0.0392,0.0293,0.1351,0.1471,-0.069,0.0836,-0.0323,-0.0824,0.0337,-0.0509,0.0206,0,0,0,0]},{"id":"black-and-white","name":"Black and White","css":"grayscale(.85) contrast(1.05) brightness(.75)","layers":[],"w":[0,0.0867,0.2098,0.0245,0.0429,0.1602,-0.0324,0.107,0.0517,0.0949,-0.0078,-0.0054,0.0126,0.0017,0.0624,-0.0866,0.0287,-0.0247,0.0322,-0.0099,-0.0146,0.0288,-0.0152,0,0,0,0,0,0.0868,0.2098,0.0245,0.043,0.1603,-0.0325,0.1066,0.0517,0.0949,-0.0078,-0.0055,0.0127,0.0017,0.0624,-0.0867,0.0288,-0.0245,0.0321,-0.0099,-0.0146,0.0287,-0.0152,0,0,0,0,0.0005,0.0862,0.21,0.0235,0.0374,0.1674,-0.0235,0.1128,0.0602,0.0711,-0.0086,0.005,-0.0024,0.0058,0.0638,-0.086,0.0267,-0.025,0.0321,-0.0097,-0.0135,0.0284,-0.0159,0,0,0,0]},{"id":"4k-ultra","name":"4K Ultra","css":"brightness(.88) contrast(1.18) saturate(1.3)","layers":[],"w":[-0.0593,0.9959,-0.152,0.0439,-0.0491,-0.0972,-0.238,0.1946,0.0336,0.2054,0.0112,0.0254,-0.0354,-0.0122,-0.0103,-0.2697,0.0083,-0.1998,0.2247,0.0544,-0.0134,0.0086,-0.0014,0,0,0,0,-0.0623,0.0194,0.9271,-0.0301,-0.0286,0.241,-0.0293,-0.195,0.1941,-0.1619,0.0018,-0.0174,0.0045,0.0052,-0.0721,-0.2134,0.003,0.0444,-0.0004,0.0372,0.0141,0.0093,-0.0296,0,0,0,0,-0.0413,0.0411,-0.1236,0.8969,-0.0148,0.3164,0.4302,-0.1661,0.2115,-0.6717,-0.0277,-0.1221,0.1526,0.0073,0.0385,-0.3132,0.0021,0.1117,0.0992,-0.1336,0.043,-0.0435,-0.0122,0,0,0,0]},{"id":"glamy","name":"glamy <3","css":"brightness(.74) contrast(.98) saturate(1.5) hue-rotate(6deg)","layers":[{"t":"tint","color":"#ffb070","blend":"soft-light","a":0.2},{"t":"glow","blur":8,"a":0.22}],"w":[-0.0037,0.9138,0.0445,-0.0524,0.087,-0.6487,-0.0142,0.3631,-0.5845,0.6079,-0.0168,-0.0756,0.0281,0.0695,0.0486,-0.2092,0.0224,-0.0968,0.1203,0.0162,-0.0437,0.0884,-0.0474,0,0,0,0,-0.0142,-0.0007,0.9823,-0.0403,0.0003,-0.6688,-0.0273,0.4161,-0.3094,0.3869,-0.0075,0.0273,-0.0551,0.0436,0.0245,-0.1488,0.0065,0.0153,0.0135,0.0061,-0.0163,0.0382,-0.0234,0,0,0,0,-0.0041,-0.1153,0.5054,0.5457,0.0915,-0.3674,0.0208,0.0629,-0.1269,0.1369,-0.0137,0.0279,-0.0388,0.035,0.0668,-0.1505,-0.0247,0.0633,0.019,-0.0448,-0.027,0.0579,-0.0348,0,0,0,0]},{"id":"natural-skin","name":"natural skin","css":"brightness(.85) contrast(.92) saturate(1.3) sepia(.12)","layers":[{"t":"tint","color":"#ffc8a0","blend":"soft-light","a":0.25}],"w":[0.0183,1.0087,0.3722,-0.3501,0.6181,0.8172,-0.2215,-2.1724,0.8064,-0.0452,-0.0356,-0.0097,0.0892,-0.0659,0.1611,-0.2532,-0.0182,-0.2009,0.2111,0.0289,-0.0951,0.1678,-0.0736,0,0,0,0,0.009,-0.0514,1.3105,-0.241,0.4646,-0.5898,0.1097,-0.2063,-0.5727,0.6163,-0.0148,0.0243,-0.0645,0.0464,0.1148,-0.1677,-0.0442,0.0038,-0.0034,0.0345,-0.0555,0.1089,-0.0587,0,0,0,0,0.0331,-0.025,0.0158,0.9741,0.2272,-0.129,0.9847,0.7435,-1.0684,-0.9025,-0.0257,-0.0566,0.105,-0.0218,0.1862,-0.2319,-0.0586,0.0545,0.0135,-0.027,-0.0903,0.1374,-0.0561,0,0,0,0]},{"id":"feel-with-reel","name":"Feel with Reel","css":"brightness(1.08) contrast(1.05) saturate(1.2) hue-rotate(8deg)","layers":[{"t":"tint","color":"#7a6bd0","blend":"soft-light","a":0.25},{"t":"grain","a":0.22},{"t":"vignette","s":0.4},{"t":"filmstrip"}],"w":[0.1229,0.2834,0.2573,0.0009,0.9399,-0.5506,0.0385,0.1058,-1.2265,0.9351,-0.009,0.1375,-0.1992,0.0651,0.0444,-0.0858,-0.0027,-0.0732,0.0454,0.0314,-0.0533,0.0932,-0.0404,0,0,0,0,0.1095,-0.0685,0.5409,0.0297,-0.1498,-0.2162,-0.0616,0.7913,-0.1108,0.0553,-0.0031,0.047,-0.0682,0.0314,0.0086,0.0215,-0.0463,0.0195,-0.0425,0.0271,-0.0273,0.0604,-0.0353,0,0,0,0,-0.0708,-0.0301,0.205,0.6659,0.6473,-0.3425,0.4884,0.2699,-1.4257,0.6143,0.0185,-0.0283,-0.0276,0.0277,0.1497,0.103,-0.0337,0.0849,-0.0271,-0.0878,0.0196,-0.0388,0.016,0,0,0,0]},{"id":"bas-a-droite","name":"Bas à droite","css":"brightness(.65) contrast(.75) saturate(.9)","layers":[{"t":"tint","color":"#ffffff","blend":"screen","a":0.3},{"t":"pip","size":0.38}],"w":[0.3057,0.312,0.1868,-0.092,0.1734,-0.2043,-0.1156,-0.0145,-0.3369,0.4965,-0.0572,-0.1658,0.1974,-0.0246,0.0118,-0.003,-0.0013,-0.0384,0.013,0.0214,-0.0737,0.2029,-0.1151,0,0,0,0,0.2868,-0.0467,0.5219,-0.0673,0.1218,-0.0679,-0.03,-0.0815,-0.1367,0.1915,-0.0529,-0.0922,0.1495,-0.036,-0.0199,0.0334,-0.0076,0.0112,-0.0296,0.0159,-0.0285,0.1266,-0.0805,0,0,0,0,0.2883,-0.0489,0.072,0.3512,0.1545,-0.0823,-0.0273,-0.0992,-0.1527,0.2294,-0.0746,0.0499,0.0682,-0.068,0.0105,-0.0098,0.0019,0.0262,-0.0029,-0.0277,0.0193,0.0399,-0.0408,0,0,0,0],"fx":"inset"},{"id":"fine-tone","name":"Fine Tone","css":"brightness(.98) contrast(.95) saturate(1.4)","layers":[],"w":[-0.0606,1.3657,-0.542,0.1548,-0.0361,-2.1328,0.1581,2.8133,-2.1513,1.3723,0.0161,0.2283,-0.2974,0.0503,0.3653,-0.2502,-0.1238,-0.3017,0.2528,0.0389,0.031,-0.0181,-0.0072,0,0,0,0,-0.0272,0.2311,0.93,-0.1142,-0.2739,-1.1987,-0.1604,1.6331,-1.0673,1.0411,0.0228,0.116,-0.2052,0.0571,0.201,-0.0091,-0.1901,-0.0887,0.0254,0.0562,0.0382,-0.0344,0.0027,0,0,0,0,0.0032,0.3052,-0.15,0.6038,0.0003,-0.63,0.122,0.6745,-0.5286,0.6032,0.0289,-0.1485,0.0877,0.0028,0.3341,-0.2371,-0.1265,0.0034,0.042,-0.0345,-0.0052,-0.0465,0.0335,0,0,0,0]},{"id":"black-ii","name":"Black II","css":"brightness(1.0) contrast(1.05) saturate(.9) hue-rotate(15deg)","layers":[{"t":"tint","color":"#1c2c55","blend":"soft-light","a":0.5},{"t":"vignette","s":0.35}],"w":[-0.0809,0.7016,0.2432,-0.176,0.4874,-0.8656,0.3464,0.7999,-1.1811,0.607,0.0673,-0.7916,-0.0538,0.2766,0.1931,-0.0642,-0.1037,-0.1312,0.0645,0.0771,-0.0687,0.069,-0.0011,0,0,0,0,-0.0676,0.1652,0.7746,-0.1179,-0.4018,0.0171,0.1485,0.6687,0.1639,-0.4962,0.0397,-0.1295,-0.6561,0.2774,0.1657,-0.0641,-0.0974,-0.0793,0.0345,0.0632,-0.0721,0.1567,-0.0816,0,0,0,0,-0.0406,-0.065,1.1296,-0.0315,-0.6551,1.4789,0.0892,-0.7172,1.6044,-1.9247,-0.0183,0.2051,-0.9406,0.2762,0.1417,-0.098,-0.0494,-0.1212,0.123,0.0233,-0.0697,0.2142,-0.1314,0,0,0,0]},{"id":"iphone-14","name":"iPhone 14","css":"brightness(.96) contrast(1.1) saturate(1.6) hue-rotate(-12deg)","layers":[{"t":"tint","color":"#1a6cff","blend":"soft-light","a":0.25}],"w":[0.0531,1.7566,-0.9698,-0.1273,-2.0503,-0.5095,-1.4804,2.275,2.6643,-0.698,-0.0301,0.3688,-0.4157,0.0948,0.5653,-0.3931,-0.1258,-0.409,0.3138,0.098,0.1139,-0.0226,-0.0924,0,0,0,0,0.0356,-0.1044,1.3842,-0.4319,0.0343,-0.7708,-0.8643,-0.0301,0.5852,1.1046,-0.0236,0.0521,-0.0868,0.0601,0.2865,-0.1339,-0.1268,-0.0512,-0.0482,0.0879,0.0237,0.0231,-0.0547,0,0,0,0,0.0674,-0.0866,-0.4339,1.1537,-0.1583,-0.3229,0.6227,0.6912,0.6388,-1.2161,-0.0419,-0.0294,0.042,0.0542,0.513,-0.4613,-0.0004,0.114,-0.0707,-0.0668,-0.0184,-0.0376,0.0252,0,0,0,0]},{"id":"prism","name":"Prism","css":"brightness(.6) contrast(.9) saturate(1.3) hue-rotate(-30deg)","layers":[{"t":"tint","color":"#2aa8b8","blend":"soft-light","a":0.45},{"t":"ghost","dx":0.05,"dy":0.03,"scale":1.08,"a":0.3},{"t":"leak","a":0.35}],"w":[0.1148,0.9797,-0.6264,-0.148,0.3127,-0.3311,0.1488,0.211,0.2004,-0.2841,0.4903,-2.8531,1.3524,0.8655,0.2429,-0.254,0.0542,0.1767,-0.0667,-0.081,-0.2544,-0.3246,0.4226,0,0,0,0,0.1329,-0.1093,0.4963,-0.0689,-0.1118,-0.215,0.679,0.9971,-0.4977,-0.6494,0.4305,-0.312,-0.9713,0.4949,0.1741,-0.1352,0.0222,0.2949,-0.2881,-0.0276,-0.5954,0.4509,0.0357,0,0,0,0,0.1669,-0.8383,0.9854,0.102,0.018,2.2721,0.6884,-1.4896,1.6445,-2.8874,0.2652,0.4391,-1.3438,0.315,0.0941,-0.0256,0.0087,0.3607,-0.3979,0.0184,-0.9012,0.9259,-0.1144,0,0,0,0],"leak":[-0.107,-0.089,-0.079,0.118,0.028,0.013,0.035,-0.012,0.026,0.017,-0.037,-0.033,0.038,0.005,-0.008,0.051,0.024,0.004,0.001,-0.005,-0.011,-0.128,-0.095,-0.075,-0.126,-0.091,-0.064,-0.055,-0.037,-0.029,-0.077,-0.078,-0.088,-0.182,-0.139,-0.121,-0.044,-0.046,-0.082,0.152,0.044,-0.005,0.036,0.027,0.058,0.029,-0.027,-0.015,0.018,-0.03,-0.022,0.084,0.024,0.006,0.029,-0.012,-0.029,0.017,-0.006,-0.01,-0.03,-0.051,-0.052,0.014,-0.003,-0.028,0.002,0.011,-0.03,-0.085,-0.054,-0.053,-0.066,0.096,0.124,-0.137,0.072,0.112,-0.13,0.063,0.076,0.019,-0.018,-0.024,0.004,-0.022,-0.004,0.026,-0.022,-0.02,0.036,-0.016,-0.037,0.057,0.021,0.005,0.067,0.026,-0.002,0.095,0.077,0.036,0.073,0.106,0.074,0.058,0.103,0.107,-0.087,0.053,0.07,-0.156,0.021,0.067,-0.088,0.006,0.002,-0.01,0.023,0.003,-0.027,-0.006,0.003,0.004,-0.012,-0.009,0.023,0.003,-0.029,0.044,0.033,-0.003,0.066,0.074,0.027,0.09,0.124,0.072,0.063,0.117,0.076,0.032,0.087,0.098,-0.001,-0.021,-0.029,0.044,-0.03,-0.074,-0.011,-0.034,-0.085,-0.01,-0.015,-0.069,-0.044,-0.01,-0.034,-0.059,-0.018,-0.024,0.006,-0.004,-0.019,0.005,0.029,0.007,0.058,0.086,0.049,0.052,0.103,0.08,0.051,0.117,0.106,0.108,0.117,0.143,-0.188,-0.178,-0.148,-0.112,-0.174,-0.184,-0.059,-0.108,-0.127,0.004,-0.038,-0.064,-0.03,-0.02,-0.04,-0.05,-0.025,-0.004,-0.025,0.004,0.035,-0.023,0.024,0.042,-0.046,0.034,0.043,-0.078,0.07,0.089,0.11,0.12,0.16,0.175,0.255,0.28,-0.196,-0.168,-0.133,-0.142,-0.151,-0.124,-0.089,-0.109,-0.09,-0.01,-0.047,-0.045,0.005,-0.019,-0.01,-0.016,-0.017,0.026,-0.018,-0.008,0.044,0.014,0.019,0.065,0.006,0.009,0.045,0.018,-0.015,0.027,0.148,0.139,0.168,0.214,0.282,0.26,-0.181,-0.159,-0.125,-0.156,-0.166,-0.125,-0.021,-0.063,-0.05,-0.113,-0.121,-0.095,-0.104,-0.104,-0.075,-0.077,-0.083,-0.044,-0.019,-0.042,0.004,0.099,0.018,0.053,0.181,0.045,0.055,0.082,-0.047,-0.033,0.182,0.092,0.027,0.233,0.268,0.213,-0.36,-0.296,-0.214,-0.289,-0.258,-0.199,-0.251,-0.225,-0.174,-0.241,-0.223,-0.177,-0.216,-0.202,-0.155,-0.166,-0.167,-0.122,0.012,-0.052,-0.023,0.195,0.059,0.057,0.166,0.027,-0.032,0.038,-0.059,-0.08,0.089,0.042,-0.041,0.229,0.279,0.233]},{"id":"vignette","name":"Vignette","css":"brightness(1.0) contrast(1.05) saturate(1.05)","layers":[{"t":"vignette","s":0.42}],"w":[0.0072,1.043,0.0629,-0.0685,-0.1437,-0.1754,-0.0782,0.2158,0.0283,0.1723,-0.0165,-0.6576,-0.0712,0.12,0.104,-0.0918,-0.0052,-0.1535,0.1205,0.029,-0.0272,0.0105,0.0172,0,0,0,0,0.0054,0.0277,1.087,-0.0673,-0.2445,0.2421,0.0697,-0.0409,0.4963,-0.5108,-0.0175,0.0103,-0.7581,0.1441,0.0172,0.0033,-0.0189,-0.0086,0.0012,0.0096,-0.0346,0.0255,0.012,0,0,0,0,0.0082,0.0465,-0.0131,0.9931,-0.2152,-0.0063,-0.0276,0.1335,0.2149,-0.0673,-0.0208,-0.0662,0.0129,-0.5402,0.0851,-0.112,0.0254,0.055,0.0479,-0.0992,-0.0252,0.0045,0.0284,0,0,0,0]},{"id":"soft","name":"soft","css":"brightness(.9) contrast(.7) saturate(.8) sepia(.12)","layers":[{"t":"tint","color":"#ffd8d0","blend":"soft-light","a":0.3},{"t":"glow","blur":10,"a":0.3}],"w":[0.0692,0.7404,0.5867,-0.1423,0.5297,0.6288,0.4322,-0.9677,-0.2939,-0.5774,0.0075,-0.0774,0.102,-0.0455,0.206,-0.0187,-0.0092,0.1905,0.112,0.0116,-0.0561,0.0737,-0.0254,0,0,0,0,0.0623,-0.0048,1.1093,0.0251,0.4374,-0.6685,-0.2746,-0.1511,-0.5386,1.0109,0.0106,0.0201,-0.1148,0.076,0.0604,0.1737,-0.0459,0.0068,0.2698,0.0264,0.0059,-0.0347,0.0215,0,0,0,0,0.0676,0.2086,0.3854,0.5445,0.2311,-0.3645,-0.089,0.0217,-0.5369,0.5395,0.0093,-0.0522,0.0754,-0.0446,0.0718,0.018,0.1019,-0.0512,0.0171,0.3345,0.0176,-0.0164,-0.0095,0,0,0,0]},{"id":"fairy-grunge","name":"- fairy grunge -","css":"brightness(.86) contrast(1.0) saturate(1.1) hue-rotate(-25deg)","layers":[{"t":"tint","color":"#38e0d8","blend":"soft-light","a":0.6},{"t":"glow","blur":10,"a":0.3},{"t":"grain","a":0.15},{"t":"vignette","s":0.35}],"w":[-0.0104,0.4985,0.1381,0.0788,0.0318,-0.0481,-0.0543,-0.0111,-0.043,0.1038,-0.0003,-0.0046,0.0586,-0.0581,0.1265,-0.0781,0.0873,0.0815,0.1203,-0.0173,0.0391,-0.067,0.0354,0,0,0,0,-0.0144,0.2151,0.8085,0.1086,0.1326,-0.0809,0.0058,-0.0545,-0.2293,0.1939,0.0007,0.0095,0.0127,-0.0213,0.1249,0.2428,0.0266,0.0199,0.291,-0.0193,0.0383,-0.0671,0.0441,0,0,0,0,-0.0069,0.215,0.3792,0.5193,0.1354,-0.1336,-0.0278,-0.0191,-0.2932,0.3181,-0.0052,0.0093,0.0219,-0.0274,0.1511,0.1405,0.1008,0.0347,0.1494,0.1076,0.035,-0.0582,0.035,0,0,0,0]},{"id":"bliss","name":"Bliss","css":"brightness(.93) contrast(1.2) saturate(1.7) hue-rotate(-8deg)","layers":[{"t":"tint","color":"#00a0ff","blend":"soft-light","a":0.2}],"w":[-0.0279,1.1635,-0.5259,-0.1886,-0.8878,0.0647,-0.6309,1.0543,1.6687,-0.6569,0.03,0.1669,-0.2347,-0.0014,0.2787,-0.0477,-0.1717,-0.287,0.1809,0.1095,0.0557,-0.097,0.0469,0,0,0,0,-0.0527,-0.0075,1.0009,-0.0955,-0.0492,0.0332,-0.2755,0.043,0.0392,0.3679,0.0125,0.0182,-0.0982,0.0767,0.0085,0.1194,-0.1074,0.0356,-0.0993,0.0597,0.0404,-0.0426,0.0117,0,0,0,0,-0.0071,-0.1389,-0.1164,0.8069,-0.1638,0.5538,0.8375,-0.2867,1.1014,-1.6146,-0.026,-0.0711,0.062,0.0839,0.242,-0.3309,0.0728,0.1248,0.0445,-0.1605,-0.0443,0.0648,-0.0267,0,0,0,0]},{"id":"90s-summer","name":"90s summer","css":"brightness(1.06) contrast(1.08) saturate(1.22) sepia(.18) hue-rotate(-6deg)","layers":[{"t":"tint","color":"#e8a040","blend":"soft-light","a":0.25},{"t":"grain","a":0.2},{"t":"vignette","s":0.3}],"w":[0.2497,1.3417,0.9359,-1.3705,0.9737,0.9228,-1.9296,-5.4153,2.0272,3.2579,-0.3829,1.775,-2.2326,0.8906,0,0,0,0,0,0,0,0,0,0.0011,-0.3486,0.268,0.148,0.1543,-0.1355,1.6094,-0.6664,0.561,-0.3813,-0.4315,-1.5913,0.3574,1.4389,-0.1616,0.4269,-1.3289,1.0859,0,0,0,0,0,0,0,0,0,-0.0017,0.3801,-0.4607,0.0888,-0.0254,-0.0683,-0.0732,1.0012,-0.346,0.3766,-0.5883,-0.5849,1.0729,0.0749,-0.0425,-0.5991,0.3046,0.3356,0,0,0,0,0,0,0,0,0,-0.0011,0.6883,-0.6232,-0.0623],"grain":0.02},{"id":"flash-ii","name":"Flash II","css":"brightness(1.18) contrast(1.28) saturate(1.15) hue-rotate(2deg)","layers":[{"t":"tint","color":"#f0f4ff","blend":"screen","a":0.15},{"t":"grain","a":0.25},{"t":"vignette","s":0.4}],"curve":{"lut":[0,0.0013,0,0,0.0031,0,0,0.0088,0,0,0.0178,0.0002,0.0002,0.028,0.0012,0.0012,0.0379,0.0043,0.0039,0.0475,0.0104,0.0085,0.0579,0.0191,0.0141,0.0699,0.0298,0.0195,0.0827,0.0434,0.0244,0.0956,0.0605,0.0293,0.1083,0.0812,0.0345,0.1208,0.1049,0.0399,0.1333,0.1305,0.0458,0.1463,0.1563,0.0521,0.1598,0.1816,0.0586,0.173,0.2065,0.0651,0.1854,0.2306,0.0717,0.1969,0.2537,0.0788,0.2074,0.2753,0.0866,0.2175,0.2951,0.0954,0.2279,0.313,0.1051,0.2388,0.3294,0.1153,0.2503,0.345,0.1261,0.2626,0.36,0.1379,0.2757,0.3749,0.1514,0.2897,0.3897,0.1667,0.3045,0.4045,0.1833,0.3199,0.419,0.2012,0.3362,0.4333,0.2216,0.3541,0.4482,0.2457,0.3742,0.4639,0.274,0.3979,0.4802,0.3061,0.4263,0.4965,0.3415,0.4583,0.513,0.3802,0.4908,0.5296,0.4232,0.5217,0.5466,0.4706,0.5511,0.5638,0.5213,0.5794,0.5812,0.5736,0.6069,0.599,0.6251,0.6335,0.6176,0.6736,0.6598,0.6378,0.7174,0.6868,0.6599,0.7559,0.7147,0.6835,0.7894,0.743,0.7066,0.8184,0.7705,0.7269,0.8438,0.7964,0.7436,0.8661,0.8204,0.758,0.8857,0.8421,0.7712,0.9031,0.8616,0.784,0.9182,0.8793,0.7964,0.9311,0.8962,0.8085,0.9419,0.9122,0.8202,0.9509,0.9265,0.8315,0.958,0.9382,0.8424,0.9629,0.9467,0.853,0.9663,0.9525,0.8638,0.9691,0.957,0.8751,0.9717,0.9609,0.8871,0.974,0.9647,0.8993,0.9765,0.9679,0.9118,0.9803,0.9708,0.9259,0.9853,0.9735,0.9411,0.988,0.9748,0.9487],"sat":[0.937,0.937,0.936,0.917,0.898,0.879,0.863,0.878,0.894,0.909,0.921,0.914,0.908,0.902,0.896,0.894,0.891,0.888,0.893,0.917,0.94,0.964,0.996,1.044,1.093,1.141,1.166,1.156,1.147,1.138,1.105,1.045,0.986,0.927,0.881,0.846,0.812,0.778,0.75,0.726,0.702,0.678,0.652,0.624,0.597,0.57,0.539,0.507,0.474,0.442,0.41,0.377,0.345,0.312,0.292,0.274,0.256,0.238,0.494,0.777,1.061,1.344,1.353,1.353],"gain":[0.247,-0.6223,0.8175]},"grain":0.03}];

  // Existing built-in filters (handled by editor.html / ffmpeg-engine.js as before).
  const CLASSIC = [
    { id: 'vivid', name: 'Vivid', emoji: '🌟' },
    { id: 'cinematic', name: 'Cinema', emoji: '🎬' },
    { id: 'warm', name: 'Warm', emoji: '🔥' },
    { id: 'cool', name: 'Cool', emoji: '❄' },
    { id: 'bw', name: 'B&W', emoji: '🏁' }
  ];

  // ---- Feature detection -----------------------------------------------------------
  const supportsCtxFilter = (() => {
    try { return typeof document !== 'undefined' && 'filter' in document.createElement('canvas').getContext('2d'); } catch (e) { return false; }
  })();

  const supportsWebGL = (() => {
    try {
      if (typeof document === 'undefined') return false;
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  })();

  // ---- CSS filter string <-> ops --------------------------------------------------
  function parseCss(css) {
    const ops = [], re = /([a-z-]+)\(\s*(-?[\d.]+)(deg)?\s*\)/g;
    let m;
    while ((m = re.exec(css || ''))) ops.push({ f: m[1], v: parseFloat(m[2]) });
    return ops;
  }
  const IDENTITY = { brightness: 1, contrast: 1, saturate: 1, sepia: 0, grayscale: 0, 'hue-rotate': 0 };
  const lerp = (op, k) => ({ f: op.f, v: IDENTITY[op.f] + (op.v - IDENTITY[op.f]) * k });
  const num = n => (+n.toFixed(4)).toString();

  const FILTERS = DEFS.map(d => Object.assign({ ops: parseCss(d.css) }, d));
  const byId = Object.fromEntries(FILTERS.map(f => [f.id, f]));
  byId.none = { id: 'none', name: 'No effect', css: '', layers: [], ops: [], w: null };
  const isPack = id => !!byId[id] && id !== 'none';
  const clampAmt = a => { a = Number(a); return Number.isFinite(a) ? Math.max(0, Math.min(100, a)) / 100 : 1; };
  const nameOf = id => (byId[id] || CLASSIC.find(c => c.id === id) || { name: id }).name;

  function previewFilter(id, amount) {
    const f = byId[id]; if (!f) return '';
    const k = clampAmt(amount);
    return f.ops.map(o => lerp(o, k)).map(o => `${o.f}(${num(o.v)}${o.f === 'hue-rotate' ? 'deg' : ''})`).join(' ');
  }

  // ---- Preview overlay (Real-time WebGL Shader Engine with 2D fallback) -------------
  let grainUrl = null;
  function grainDataUrl() {
    if (grainUrl) return grainUrl;
    try {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'), d = g.createImageData(128, 128);
      for (let i = 0; i < d.data.length; i += 4) { const v = 100 + Math.random() * 56; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      g.putImageData(d, 0, 0); grainUrl = c.toDataURL();
    } catch (e) { grainUrl = ''; }
    return grainUrl;
  }
  const BLEND = { 'soft-light': 'soft-light', screen: 'screen', overlay: 'overlay', multiply: 'multiply' };
  const abs = (extra) => `position:absolute;pointer-events:none;${extra}`;
  let mirrors = [], raf = 0, mirrorVideo = null;
  let webglOverlay = null;

  function clearPreview(screen) {
    const o = screen && screen.querySelector('.cfp-overlay');
    if (o) o.remove();
    if (webglOverlay) {
      if (webglOverlay.raf) cancelAnimationFrame(webglOverlay.raf);
      webglOverlay = null;
    }
    mirrors = [];
  }

  function getVideoDisplayRect(video) {
    const elW = video.offsetWidth || video.clientWidth || 0;
    const elH = video.offsetHeight || video.clientHeight || 0;
    const vw = video.videoWidth || elW;
    const vh = video.videoHeight || elH;
    if (!vw || !vh || !elW || !elH) return { left: video.offsetLeft || 0, top: video.offsetTop || 0, width: elW, height: elH, vw, vh };
    const s = Math.min(elW / vw, elH / vh);
    const dw = vw * s;
    const dh = vh * s;
    const dx = (elW - dw) / 2;
    const dy = (elH - dh) / 2;
    return {
      left: Math.round((video.offsetLeft || 0) + dx),
      top: Math.round((video.offsetTop || 0) + dy),
      width: Math.round(dw),
      height: Math.round(dh),
      vw,
      vh
    };
  }

  function mirrorLoop() {
    raf = mirrors.length ? requestAnimationFrame(mirrorLoop) : 0;
    const v = mirrorVideo;
    if (!v || v.readyState < 2 || !v.videoWidth) return;
    for (const m of mirrors) {
      const c = m.canvas, w = v.videoWidth, h = v.videoHeight;
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const g = c.getContext('2d'); g.clearRect(0, 0, w, h);
      if (m.kind === 'ghost') {
        const sw = w * m.s, sh = h * m.s;
        g.drawImage(v, w * m.dx - (sw - w) / 2, h * m.dy - (sh - h) / 2, sw, sh);
      } else g.drawImage(v, 0, 0, w, h);
    }
  }

  function syncPreview(screen, video, id, amount) {
    const f = byId[id];
    if (!screen || !video || !f || id === 'none') {
      clearPreview(screen);
      return;
    }
    const k = clampAmt(amount);
    let o = screen.querySelector('.cfp-overlay');
    if (!o) {
      o = document.createElement('div');
      o.className = 'cfp-overlay';
      o.style.cssText = abs('z-index:2;overflow:hidden;pointer-events:none;');
      video.insertAdjacentElement('afterend', o);
    }

    const rect = getVideoDisplayRect(video);
    o.style.left = rect.left + 'px';
    o.style.top = rect.top + 'px';
    o.style.width = rect.width + 'px';
    o.style.height = rect.height + 'px';
    o.style.transform = video.style.transform || '';
    o.style.transformOrigin = video.style.transformOrigin || 'center center';
    o.style.display = (video.style.display === 'none' || rect.width === 0) ? 'none' : 'block';

    // 1. Hardware WebGL Shader Engine (exact pixel match with demo.html)
    if (supportsWebGL && (f.w || f.curve)) {
      if (!webglOverlay || webglOverlay.container !== o) {
        o.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:fill;pointer-events:none;display:block;';
        o.appendChild(canvas);
        let renderer = null;
        try {
          renderer = new FilterRenderer(canvas);
        } catch (e) {
          renderer = null;
        }
        webglOverlay = {
          container: o,
          canvas,
          renderer,
          filter: f,
          amount: k,
          video,
          raf: 0
        };
      }
      webglOverlay.filter = f;
      webglOverlay.amount = k;
      webglOverlay.video = video;

      if (webglOverlay.renderer) {
        const renderFrame = (t) => {
          if (!webglOverlay || !webglOverlay.renderer || !video) return;
          const currentRect = getVideoDisplayRect(video);
          o.style.left = currentRect.left + 'px';
          o.style.top = currentRect.top + 'px';
          o.style.width = currentRect.width + 'px';
          o.style.height = currentRect.height + 'px';
          o.style.transform = video.style.transform || '';
          o.style.transformOrigin = video.style.transformOrigin || 'center center';
          if (currentRect.vw > 0 && currentRect.vh > 0 && video.readyState >= 2) {
            webglOverlay.renderer.render(
              video,
              webglOverlay.filter,
              webglOverlay.amount,
              (t || performance.now()) / 1000,
              currentRect.vw,
              currentRect.vh
            );
          }
          if (!video.paused && !video.ended) {
            webglOverlay.raf = requestAnimationFrame(renderFrame);
          } else {
            webglOverlay.raf = 0;
          }
        };

        renderFrame(performance.now());

        if (!video._cfp_hooked) {
          video._cfp_hooked = true;
          const onPlay = () => {
            if (webglOverlay && !webglOverlay.raf) {
              webglOverlay.raf = requestAnimationFrame(renderFrame);
            }
          };
          const onUpdate = () => {
            if (webglOverlay && video.paused) {
              renderFrame(performance.now());
            }
          };
          video.addEventListener('play', onPlay);
          video.addEventListener('timeupdate', onUpdate);
          video.addEventListener('seeked', onUpdate);
          video.addEventListener('loadeddata', onUpdate);
        }

        if (!video.paused && !video.ended && !webglOverlay.raf) {
          webglOverlay.raf = requestAnimationFrame(renderFrame);
        }
        return;
      }
    }

    // 2. 2D Canvas / CSS Overlay Fallback
    const key = id + '|' + k;
    mirrorVideo = video;
    if (o.dataset.key === key) return;
    o.dataset.key = key; o.innerHTML = ''; mirrors = [];
    const grade = previewFilter(id, amount);
    const add = (style, html = '') => { const d = document.createElement('div'); d.style.cssText = abs(style); d.innerHTML = html; o.appendChild(d); return d; };
    const addCanvas = (style, kind, extra = {}) => {
      const c = document.createElement('canvas'); c.style.cssText = abs(style + 'left:0;top:0;width:100%;height:100%;');
      mirrors.push(Object.assign({ canvas: c, kind }, extra)); return c;
    };
    for (const L of (f.layers || [])) {
      const a = (L.a ?? 1) * k;
      if (L.t === 'tint') add(`inset:0;background:${L.color};mix-blend-mode:${BLEND[L.blend] || 'normal'};opacity:${a};`);
      else if (L.t === 'vignette') add(`inset:0;background:radial-gradient(circle farthest-corner at 50% 50%,rgba(0,0,0,0) 35%,rgba(0,0,0,${L.s * k}) 100%);`);
      else if (L.t === 'grain') { const u = grainDataUrl(); if (u) add(`inset:0;background:url(${u});mix-blend-mode:overlay;opacity:${a};`); }
      else if (L.t === 'filmstrip') {
        const s = add(`left:0;top:0;width:8%;height:100%;background:rgba(0,0,0,${.65 * k});display:flex;flex-direction:column;justify-content:space-around;align-items:center;`);
        for (let i = 0; i < 9; i++) { const r = document.createElement('i'); r.style.cssText = `display:block;width:50%;height:4.5%;background:rgba(255,255,255,${.75 * k});`; s.appendChild(r); }
      } else if (L.t === 'leak') add(`inset:0;mix-blend-mode:screen;opacity:${a};background:` +
        'radial-gradient(circle at 85% 90%,rgba(255,190,80,.9),rgba(255,190,80,0) 70%),' +
        'radial-gradient(circle at 10% 10%,rgba(255,80,200,.5),rgba(255,80,200,0) 50%);');
      else if (L.t === 'glow') o.appendChild(addCanvas(`mix-blend-mode:screen;opacity:${a};filter:${grade} blur(${L.blur}px);`, 'glow'));
      else if (L.t === 'ghost') o.appendChild(addCanvas(`mix-blend-mode:screen;opacity:${a};`, 'ghost', { s: L.scale, dx: L.dx, dy: L.dy }));
      else if (L.t === 'pip') {
        const c = addCanvas(`opacity:${k};border:2px solid #fff;box-sizing:border-box;`, 'pip');
        Object.assign(c.style, { left: 'auto', top: 'auto', right: '0', bottom: '0',
          width: (L.size * 100) + '%', height: (L.size * 100) + '%' });
        o.appendChild(c);
      } else if (L.t === 'split') {
        [['#ff0040', L.dx], ['#00e0ff', -L.dx]].forEach(([col, dx]) => {
          const w = add(`inset:0;isolation:isolate;mix-blend-mode:screen;opacity:${a};transform:translateX(${dx * 100}%);`);
          w.appendChild(addCanvas('', 'split'));
          const t = document.createElement('div');
          t.style.cssText = abs(`inset:0;background:${col};mix-blend-mode:multiply;`); w.appendChild(t);
        });
      }
    }
    if (mirrors.length && !raf) raf = requestAnimationFrame(mirrorLoop);
  }

  // ---- FFmpeg export graph -------------------------------------------------------------
  const MAT_I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const mul = (A, B) => A.map((r, i) => B[0].map((_, j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  function matrixFor(op) {
    const v = op.v;
    if (op.f === 'saturate') return [[.213 + .787 * v, .715 - .715 * v, .072 - .072 * v], [.213 - .213 * v, .715 + .285 * v, .072 - .072 * v], [.213 - .213 * v, .715 - .715 * v, .072 + .928 * v]];
    if (op.f === 'grayscale') { const t = 1 - v; return [[.2126 + .7874 * t, .7152 - .7152 * t, .0722 - .0722 * t], [.2126 - .2126 * t, .7152 + .2848 * t, .0722 - .0722 * t], [.2126 - .2126 * t, .7152 - .7152 * t, .0722 + .9278 * t]]; }
    if (op.f === 'sepia') { const t = 1 - v; return [[.393 + .607 * t, .769 - .769 * t, .189 - .189 * t], [.349 - .349 * t, .686 + .314 * t, .168 - .168 * t], [.272 - .272 * t, .534 - .534 * t, .131 + .869 * t]]; }
    if (op.f === 'hue-rotate') {
      const r = v * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      return [[.213 + c * .787 - s * .213, .715 - c * .715 - s * .715, .072 - c * .072 + s * .928],
              [.213 - c * .213 + s * .143, .715 + c * .285 + s * .140, .072 - c * .072 - s * .283],
              [.213 - c * .213 - s * .787, .715 - c * .715 + s * .715, .072 + c * .928 + s * .072]];
    }
    return null;
  }
  const mixer = M => 'colorchannelmixer=' + ['rr', 'rg', 'rb', 'gr', 'gg', 'gb', 'br', 'bg', 'bb']
    .map((k, i) => `${k}=${num(Math.max(-2, Math.min(2, M[(i / 3) | 0][i % 3])))}`).join(':');
  const lut = expr => ['r', 'g', 'b'].map(c => `${c}='${expr}'`).join(':');

  function gradeChain(ops) {
    const out = []; let M = null;
    const flush = () => { if (M) { out.push(mixer(M)); M = null; } };
    for (const op of ops) {
      const m = matrixFor(op);
      if (m) { M = mul(m, M || MAT_I); continue; }
      flush();
      if (op.f === 'brightness' && Math.abs(op.v - 1) > 1e-4) out.push(`lutrgb=${lut(`clip(val*${num(op.v)},0,maxval)`)}`);
      else if (op.f === 'contrast' && Math.abs(op.v - 1) > 1e-4) out.push(`lutrgb=${lut(`clip((val-maxval/2)*${num(op.v)}+maxval/2,0,maxval)`)}`);
    }
    flush();
    return out.join(',');
  }
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const FF_BLEND = { 'soft-light': 'softlight', screen: 'screen', overlay: 'overlay', multiply: 'multiply' };

  /** Returns filter_complex segments turning stream `inL` into `outL` (labels include []). */
  function ffmpegStage(id, amount, inL, outL, uid) {
    const f = byId[id]; if (!f) return null;
    const k = clampAmt(amount), parts = [];
    if (k === 0) return [`${inL}null${outL}`]; // strength 0 = untouched
    let n = 0; const lab = () => `[cf${uid}_${n++}]`;
    const layers = f.layers || [];
    const rawUsers = layers.filter(L => L.t === 'pip' || L.t === 'ghost');
    let cur = inL, raws = [];
    if (rawUsers.length) {
      const g = lab(); raws = rawUsers.map(lab);
      parts.push(`${cur}split=${1 + raws.length}${g}${raws.join('')}`); cur = g;
    }
    const chain = gradeChain(f.ops.map(o => lerp(o, k)));
    if (chain) { const nx = lab(); parts.push(`${cur}${chain}${nx}`); cur = nx; }
    const blendWith = (srcChain, mode, opacity) => {
      const a = lab(), b = lab(), c = lab(), nx = lab();
      parts.push(`${cur}split=2${a}${b}`, `${b}${srcChain}${c}`, `${a}${c}blend=all_mode=${mode}:all_opacity=${num(opacity)}${nx}`);
      cur = nx;
    };
    for (const L of layers) {
      const a = (L.a ?? 1) * k;
      if (a <= 0 && !['vignette', 'filmstrip', 'pip', 'ghost'].includes(L.t)) continue;
      if (L.t === 'tint') { const [r, g, b] = hexRgb(L.color); blendWith(`lutrgb=r=${r}:g=${g}:b=${b}`, FF_BLEND[L.blend] || 'normal', a); }
      else if (L.t === 'vignette') {
        const s = Math.min(1, L.s * k);
        if (s > 0.02) { const nx = lab(); parts.push(`${cur}vignette=angle=${num(Math.acos(Math.pow(1 - 0.9 * s, 0.25)))}:mode=forward${nx}`); cur = nx; }
      } else if (L.t === 'grain') { const nx = lab(); parts.push(`${cur}noise=alls=${Math.round(a * 70)}:allf=t${nx}`); cur = nx; }
      else if (L.t === 'split') blendWith('rgbashift=rh=5:bh=-5', 'normal', Math.min(1, a * 1.4));
      else if (L.t === 'glow') blendWith(`gblur=sigma=${num(L.blur * 1.5)}`, 'screen', a);
      else if (L.t === 'leak') blendWith('lutrgb=r=255:g=190:b=80', 'screen', a * 0.3);
      else if (L.t === 'ghost') {
        const src = raws.shift(), c = lab(), nx = lab();
        parts.push(`${src}scale=iw*${L.scale}:ih*${L.scale},crop=w=iw/${L.scale}:h=ih/${L.scale}:x=(iw-ow)/2-ow*${L.dx}:y=(ih-oh)/2-oh*${L.dy}${c}`,
          `${cur}${c}blend=all_mode=screen:all_opacity=${num(a)}${nx}`);
        cur = nx;
      } else if (L.t === 'pip') {
        const src = raws.shift(), p = lab(), nx = lab();
        parts.push(`${src}scale=iw*${L.size}:ih*${L.size},drawbox=x=0:y=0:w=iw:h=ih:color=white:t=2${p}`,
          `${cur}${p}overlay=x=W-w:y=H-h${nx}`);
        cur = nx;
      } else if (L.t === 'filmstrip') {
        const boxes = [`drawbox=x=0:y=0:w=iw*0.08:h=ih:color=black@${num(.65 * k)}:t=fill`];
        for (let i = 0; i < 9; i++) boxes.push(`drawbox=x=iw*0.02:y=ih*${num(i / 9 + (1 / 9) * .275)}:w=iw*0.04:h=ih*${num(.45 / 9)}:color=white@${num(.75 * k)}:t=fill`);
        const nx = lab(); parts.push(`${cur}${boxes.join(',')}${nx}`); cur = nx;
      }
    }
    parts.push(`${cur}null${outL}`);
    return parts;
  }

  // ---- Properties panel ---------------------------------------------------------------
  let _thumbSampleSource = null;
  let _thumbRenderer = null;
  function renderFilterThumbs() {
    if (typeof document === 'undefined') return;
    const canvases = document.querySelectorAll('.cfp-thumb-canvas');
    if (!canvases.length) return;
    if (!_thumbRenderer) {
      try {
        const off = document.createElement('canvas');
        off.width = 96; off.height = 96;
        _thumbRenderer = new FilterRenderer(off);
      } catch (e) {
        _thumbRenderer = null;
      }
    }
    if (!_thumbRenderer) return;

    if (!_thumbSampleSource) {
      const vid = document.getElementById('previewVideo');
      if (vid && vid.videoWidth > 0 && vid.readyState >= 2) {
        _thumbSampleSource = vid;
      } else {
        const c = document.createElement('canvas');
        c.width = 192; c.height = 192;
        const x = c.getContext('2d');
        const g = x.createLinearGradient(0, 0, 192, 192);
        g.addColorStop(0, '#3b7a4a');
        g.addColorStop(0.5, '#9fb9d8');
        g.addColorStop(1, '#b0703c');
        x.fillStyle = g; x.fillRect(0, 0, 192, 192);
        [['#ef4444', 40, 100], ['#10b981', 86, 110], ['#3b82f6', 132, 100]].forEach(([col, cx, cy]) => {
          x.fillStyle = col; x.beginPath(); x.arc(cx, cy, 25, 0, 7); x.fill();
          x.fillStyle = '#f1c9a5'; x.beginPath(); x.arc(cx, cy - 35, 14, 0, 7); x.fill();
        });
        _thumbSampleSource = c;
      }
    }

    canvases.forEach(canvas => {
      if (canvas._rendered) return;
      const filterId = canvas.dataset.filter;
      const f = byId[filterId];
      if (f) {
        try {
          _thumbRenderer.render(_thumbSampleSource, f, 1, 0.9, 96, 96);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(_thumbRenderer.canvas, 0, 0, canvas.width, canvas.height);
            canvas._rendered = true;
          }
        } catch (e) {}
      }
    });
  }

  const CATEGORIES = {
    vfx: ['toxic-glitch', 'bas-a-droite', 'prism', 'fairy-grunge'],
    film: ['aesthetic-brown', 'feel-with-reel', 'black-ii', '90s-summer', 'flash-ii', 'cinematic'],
    mood: ['low-light', 'view-hd', 'glamy', 'natural-skin', 'fine-tone', 'iphone-14', 'vignette', 'soft', 'bliss', 'vivid', 'warm', 'cool', 'black-and-white', 'bw']
  };

  function getFavorites() {
    try {
      if (typeof localStorage === 'undefined') return new Set();
      return new Set(JSON.parse(localStorage.getItem('cm-fav-filters') || '[]'));
    } catch (e) { return new Set(); }
  }

  function toggleFavorite(id, ev) {
    if (ev) {
      if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
      if (typeof ev.preventDefault === 'function') ev.preventDefault();
    }
    const favs = getFavorites();
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cm-fav-filters', JSON.stringify([...favs]));
      }
    } catch (e) {}
    syncFavoritesUI();
  }

  function syncFavoritesUI() {
    if (typeof document === 'undefined') return;
    const favs = getFavorites();
    document.querySelectorAll('.cfp-fav-btn').forEach(btn => {
      const fid = btn.dataset.favId;
      const isFav = favs.has(fid);
      btn.textContent = isFav ? '★' : '☆';
      btn.style.color = isFav ? '#fbbf24' : 'rgba(255,255,255,0.45)';
      btn.setAttribute('aria-label', isFav ? `Remove ${fid} from favorites` : `Add ${fid} to favorites`);
    });
    const activeTab = document.querySelector('.cfp-cat-tab.active');
    if (activeTab && activeTab.dataset.cat === 'fav') {
      filterByCat('fav');
    }
  }

  function filterByCat(cat) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.cfp-cat-tab').forEach(t => {
      const isActive = t.dataset.cat === cat;
      t.classList.toggle('active', isActive);
      t.style.background = isActive ? 'var(--accent-primary,#8b5cf6)' : 'rgba(255,255,255,0.06)';
      t.style.color = isActive ? '#fff' : 'var(--text-secondary)';
      t.style.fontWeight = isActive ? '600' : '500';
    });
    const favs = getFavorites();
    document.querySelectorAll('#filterChipGrid .cfp-bubble-item').forEach(el => {
      const fid = el.dataset.filterId;
      if (!fid || fid === 'none') { el.style.display = 'flex'; return; }
      if (cat === 'all') el.style.display = 'flex';
      else if (cat === 'fav') el.style.display = favs.has(fid) ? 'flex' : 'none';
      else if (cat === 'vfx') el.style.display = CATEGORIES.vfx.includes(fid) ? 'flex' : 'none';
      else if (cat === 'film') el.style.display = CATEGORIES.film.includes(fid) ? 'flex' : 'none';
      else if (cat === 'mood') el.style.display = CATEGORIES.mood.includes(fid) ? 'flex' : 'none';
      else el.style.display = 'flex';
    });
  }

  function favBtnHtml(id) {
    return `<button type="button" class="cfp-fav-btn" data-fav-id="${id}" onclick="ClipFilterPack.toggleFavorite('${id}', event)" aria-label="Favorite filter" title="Favorite filter" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);border:none;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.45);font-size:11px;line-height:1;z-index:4;padding:0;transition:transform 0.15s,color 0.15s;">☆</button>`;
  }

  function chip(id, name, emoji) {
    return `<div class="cfp-bubble-item chip-option" data-filter-id="${id}" onclick="selectChipGroup(this,'filterSelectVal','${id}');applyClipFilter('${id}');" title="${name}" style="position:relative;">
      ${favBtnHtml(id)}
      <div class="cfp-bubble">
        <span style="font-size:1.3rem;">${emoji || '🎨'}</span>
      </div>
      <span class="cfp-bubble-name">${name}</span>
    </div>`;
  }

  function filterBubble(f) {
    return `<div class="cfp-bubble-item chip-option" data-filter-id="${f.id}" onclick="selectChipGroup(this,'filterSelectVal','${f.id}');applyClipFilter('${f.id}');" title="${f.name}" style="position:relative;">
      ${favBtnHtml(f.id)}
      <div class="cfp-bubble">
        <canvas class="cfp-thumb-canvas" data-filter="${f.id}" width="96" height="96"></canvas>
      </div>
      <span class="cfp-bubble-name">${f.name}</span>
    </div>`;
  }

  function panelHtml() {
    return `<div class="prop-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div class="prop-section-title" style="margin:0;">WebGL Filter Engine</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="applyClipFilter('none'); if(document.getElementById('filterAmount')){document.getElementById('filterAmount').value=100;document.getElementById('filterAmountValue').textContent='100%';}" style="padding:2px 8px;font-size:0.7rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:6px;cursor:pointer;color:var(--text-secondary);" title="Reset to original unfiltered media">↺ Reset</button>
          <span style="font-size:0.65rem;padding:2px 7px;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);border-radius:100px;color:#c084fc;font-weight:700;">GLSL 60FPS</span>
        </div>
      </div>

      <div class="cfp-cat-tabs" style="display:flex;gap:4px;overflow-x:auto;padding-bottom:6px;margin-bottom:8px;scrollbar-width:none;">
        <button type="button" class="cfp-cat-tab active" data-cat="all" onclick="ClipFilterPack.filterByCat('all')" style="padding:3px 9px;font-size:0.7rem;border-radius:12px;background:var(--accent-primary,#8b5cf6);color:#fff;border:none;cursor:pointer;white-space:nowrap;font-weight:600;">All (25)</button>
        <button type="button" class="cfp-cat-tab" data-cat="fav" onclick="ClipFilterPack.filterByCat('fav')" style="padding:3px 9px;font-size:0.7rem;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--text-secondary);border:1px solid rgba(255,255,255,0.1);cursor:pointer;white-space:nowrap;font-weight:500;">★ Favorites</button>
        <button type="button" class="cfp-cat-tab" data-cat="mood" onclick="ClipFilterPack.filterByCat('mood')" style="padding:3px 9px;font-size:0.7rem;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--text-secondary);border:1px solid rgba(255,255,255,0.1);cursor:pointer;white-space:nowrap;font-weight:500;">Aesthetic</button>
        <button type="button" class="cfp-cat-tab" data-cat="film" onclick="ClipFilterPack.filterByCat('film')" style="padding:3px 9px;font-size:0.7rem;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--text-secondary);border:1px solid rgba(255,255,255,0.1);cursor:pointer;white-space:nowrap;font-weight:500;">Film & Retro</button>
        <button type="button" class="cfp-cat-tab" data-cat="vfx" onclick="ClipFilterPack.filterByCat('vfx')" style="padding:3px 9px;font-size:0.7rem;border-radius:12px;background:rgba(255,255,255,0.06);color:var(--text-secondary);border:1px solid rgba(255,255,255,0.1);cursor:pointer;white-space:nowrap;font-weight:500;">VFX & Glitch</button>
      </div>

      <div class="cfp-bubble-grid" id="filterChipGrid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 8px;max-height:48vh;overflow-y:auto;padding:6px 2px;margin-bottom:10px;">
        <div class="cfp-bubble-item chip-option active" data-filter-id="none" onclick="selectChipGroup(this,'filterSelectVal','none');applyClipFilter('none');" title="No Filter / Original" style="position:relative;">
          <div class="cfp-bubble" style="display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#94a3b8;border:2px solid rgba(255,255,255,0.2);">
            ⊘
          </div>
          <span class="cfp-bubble-name">Original</span>
        </div>
        ${FILTERS.map(f => filterBubble(f)).join('')}
        ${CLASSIC.map(c => chip(c.id, c.name, c.emoji)).join('')}
      </div>

      <input type="hidden" id="filterSelectVal" value="none"/>

      <div id="filterAmountRow" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px;margin-top:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <label for="filterAmount" style="font-size:.78rem;font-weight:600;color:var(--text-primary)">Filter Intensity</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" onclick="if(document.getElementById('filterAmount')){document.getElementById('filterAmount').value=100;applyClipFilterAmount(100);}" style="background:none;border:none;font-size:0.68rem;color:var(--text-muted);cursor:pointer;text-decoration:underline;" title="Set to 100%">100%</button>
            <span id="filterAmountValue" style="font-size:.8rem;font-weight:700;color:#38bdf8;">100%</span>
          </div>
        </div>
        <input type="range" id="filterAmount" min="0" max="100" value="100" style="width:100%;accent-color:#a855f7;" aria-label="Filter strength"
          oninput="applyClipFilterAmount(this.value)"/>
      </div>
      <p style="color:var(--text-secondary);font-size:.72rem;margin-top:8px;text-align:center;">Hardware WebGL GLSL filter engine with lossless export parity.</p>
    </div>`;
  }

  function syncPanel(clip) {
    const id = (clip && clip.filter) || 'none';
    document.querySelectorAll('#filterChipGrid .chip-option').forEach(c => c.classList.toggle('active', c.dataset.filterId === id));
    const amt = clip && clip.filterAmount != null ? clip.filterAmount : 100;
    const r = document.getElementById('filterAmount'), v = document.getElementById('filterAmountValue');
    if (r) r.value = amt; if (v) v.textContent = amt + '%';
    setTimeout(() => {
      renderFilterThumbs();
      syncFavoritesUI();
    }, 20);
  }

  // ---- WebGL FilterRenderer -----------------------------------------------------------
  class FilterRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      if (!canvas || typeof canvas.getContext !== 'function') throw new Error('Canvas not supported');
      const gl = this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
      if (!gl) throw new Error('WebGL not supported');
      const vs = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0,1);}';
      const fs = `precision highp float;
        varying vec2 uv; uniform sampler2D tex, leakTex, curveTex;
        uniform float W[81]; uniform mat3 G0,G1; uniform vec3 GB; uniform float useCurve,grain; uniform vec3 cg; uniform float amt,time,aspect,fx,useLeak;
        const float RHO0=3./576.,RHO1=8./576.,RHO2=40./576.;
        float hash(float n){return fract(sin(n*91.345)*43758.5453);}
        vec3 blurAt(vec2 u,float rho){
          vec3 s=texture2D(tex,u).rgb; vec2 k=vec2(1.,aspect)*rho;
          for(int i=0;i<8;i++){
            float a=float(i)*.785398;
            s+=texture2D(tex,u+k*.5*vec2(cos(a),sin(a))).rgb;
            s+=texture2D(tex,u+k*.9*vec2(cos(a+.39),sin(a+.39))).rgb;
          }
          return s/17.;
        }
        vec3 grade(vec2 u){
          if(useCurve>.5){                          // curve mode (Flash II): per-channel tone curve + falloff + luma-dependent saturation
            vec3 c0=texture2D(tex,u).rgb; vec3 cc=c0*(63./64.)+.5/64.;
            vec3 o2=vec3(texture2D(curveTex,vec2(cc.r,.25)).r,texture2D(curveTex,vec2(cc.g,.25)).g,texture2D(curveTex,vec2(cc.b,.25)).b);
            vec2 q2=(u-.5)*2.; float rad2=(q2.x*q2.x+q2.y*q2.y)*.5;
            o2*=exp(cg.x+cg.y*rad2+cg.z*(-q2.y));
            float l=dot(o2,vec3(.299,.587,.114));
            float sa=texture2D(curveTex,vec2(clamp(l,0.,1.)*(63./64.)+.5/64.,.75)).r*2.;
            o2=vec3(l)+(o2-vec3(l))*sa;
            return clamp(o2,0.,1.);
          }
          vec3 c=texture2D(tex,u).rgb;
          float r=c.r,g=c.g,b=c.b;
          vec2 q=(u-.5)*2.; float rad=(q.x*q.x+q.y*q.y)*.5;
          float f[27]; float vy=-q.y;
          f[0]=1.;f[1]=r;f[2]=g;f[3]=b;f[4]=r*r;f[5]=g*g;f[6]=b*b;f[7]=r*g;f[8]=r*b;f[9]=g*b;
          f[10]=rad;f[11]=r*rad;f[12]=g*rad;f[13]=b*rad;
          vec3 h0=blurAt(u,RHO0)-c, h1=blurAt(u,RHO1)-c, h2=blurAt(u,RHO2)-c;
          f[14]=h0.r;f[15]=h0.g;f[16]=h0.b;f[17]=h1.r;f[18]=h1.g;f[19]=h1.b;f[20]=h2.r;f[21]=h2.g;f[22]=h2.b;
          f[23]=vy;f[24]=r*vy;f[25]=g*vy;f[26]=b*vy;
          vec3 o=vec3(0.);
          for(int i=0;i<27;i++){o.r+=W[i]*f[i];o.g+=W[27+i]*f[i];o.b+=W[54+i]*f[i];}
          if(useLeak>.5) o+=texture2D(leakTex,u).rgb-.5;
          return clamp(o,0.,1.);
        }
        void main(){
          vec2 u=uv; vec3 orig=texture2D(tex,u).rgb; vec3 o;
          if(fx>.5&&fx<1.5){                       // Toxic Glitch (measured from screen recording)
            // every 0.1s: 35% of steps are clean, else the red layer jumps right by 0..4% of width
            float t=floor(time*10.); float sh=hash(t)<.35?0.:.04*hash(t+17.);
            vec3 g=grade(u); o=g;
            if(sh>.0015){
              vec3 gs=grade(u-vec2(sh,0.));        // shifted copy of the graded image
              vec3 mx=G0*g+G1*gs+GB;               // fitted channel mixing (red layer separates from green/blue)
              o=mix(g,clamp(mx,0.,1.),clamp(sh/.006,0.,1.));
            }
          } else o=grade(u);
          if(fx>1.5){                               // Bas à droite: half-size copy of the original, bottom-right
            float x=u.x, y=1.-u.y;
            if(x>.4219&&x<.9253&&y>.7172){
              vec2 iu=vec2((x-.4219)/.5033,1.-(y-.7172)/.5033);
              o=texture2D(tex,iu).rgb;
            }
          }
          if(grain>0.){ float n=fract(sin(dot(u*vec2(913.,1177.)+floor(time*12.)*vec2(.37,.71),vec2(12.9898,78.233)))*43758.5453);
            o=clamp(o+(n-.5)*3.4641*grain,0.,1.); }
          gl_FragColor=vec4(mix(orig,o,amt),1.);
        }`;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const pr = this.prog = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const mkT = (unit) => {
        gl.activeTexture(gl.TEXTURE0 + unit); const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
        [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR)); return t;
      };
      this.tex = mkT(0); this.leak = mkT(1); this.curveT = mkT(2);
      gl.uniform1i(this.u('tex'), 0); gl.uniform1i(this.u('leakTex'), 1); gl.uniform1i(this.u('curveTex'), 2);
      this.lastCurve = undefined; this.setCurve(null);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      this.lastLeak = null;
    }
    u(n) { return this.gl.getUniformLocation(this.prog, n); }
    setLeak(f) {
      const gl = this.gl; if (this.lastLeak === f) return; this.lastLeak = f;
      gl.activeTexture(gl.TEXTURE1);
      const d = new Uint8Array(12 * 9 * 4);
      for (let j = 0; j < 9; j++) for (let i = 0; i < 12; i++) {
        const src = (j * 12 + i) * 3, dst = ((8 - j) * 12 + i) * 4;
        for (let c = 0; c < 3; c++) d[dst + c] = Math.max(0, Math.min(255, Math.round(((f ? f[src + c] : 0) + .5) * 255)));
        d[dst + 3] = 255;
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 12, 9, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }
    setCurve(c) {
      const gl = this.gl; if (this.lastCurve === c) return; this.lastCurve = c;
      gl.activeTexture(gl.TEXTURE2);
      const d = new Uint8Array(64 * 2 * 4);
      for (let i = 0; i < 64; i++) {
        for (let k = 0; k < 3; k++) d[i * 4 + k] = c ? Math.max(0, Math.min(255, Math.round(c.lut[i * 3 + k] * 255))) : 0;
        d[i * 4 + 3] = 255;
        d[(64 + i) * 4] = c ? Math.max(0, Math.min(255, Math.round(c.sat[i] / 2 * 255))) : 0;
        d[(64 + i) * 4 + 3] = 255;
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }
    /** source: img | video | canvas.  filter: entry of FILTERS or null */
    render(source, filter, amount = 1, time = 0, w, h) {
      const { gl, canvas } = this;
      if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      const ident = new Array(81).fill(0); [1, 27 + 2, 54 + 3].forEach(i => ident[i] = 1);
      gl.uniform1fv(this.u('W[0]'), filter && filter.w ? filter.w : ident);
      this.setCurve(filter && filter.curve ? filter.curve : null);
      gl.uniform1f(this.u('useCurve'), filter && filter.curve ? 1 : 0);
      gl.uniform3fv(this.u('cg'), filter && filter.curve ? filter.curve.gain : [0, 0, 0]);
      gl.uniform1f(this.u('grain'), filter && filter.grain ? filter.grain : 0);
      this.setLeak(filter && filter.leak ? filter.leak : null);
      gl.uniform1f(this.u('useLeak'), filter && filter.leak ? 1 : 0);
      gl.uniform1f(this.u('fx'), filter && filter.fx === 'glitch' ? 1 : filter && filter.fx === 'inset' ? 2 : 0);
      gl.uniformMatrix3fv(this.u('G0'), false, [0.0729999989271164, -0.12200000137090683, -0.11100000143051147, -0.08100000023841858, 0.6079999804496765, 0.07500000298023224, -0.06700000166893005, 0.21799999475479126, 0.7900000214576721]);
      gl.uniformMatrix3fv(this.u('G1'), false, [0.5090000033378601, 0.07199999690055847, 0.024000000208616257, 1.1790000200271606, 0.35600000619888306, 0.017999999225139618, -0.6759999990463257, -0.1340000033378601, 0.17299999296665192]);
      gl.uniform3fv(this.u('GB'), [0.012000000104308128, -0.004000000189989805, -0.006000000052154064]);
      gl.uniform1f(this.u('amt'), filter ? amount : 0);
      gl.uniform1f(this.u('time'), time);
      gl.uniform1f(this.u('aspect'), canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  // ---- Canvas Renderer (WebGL accelerated with 2D fallback) ----------------------------
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  let grainTile = null;
  function getGrain() {
    if (grainTile) return grainTile;
    grainTile = mk(256, 256);
    const g = grainTile.getContext('2d'), d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 100 + Math.random() * 56;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return grainTile;
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.filter = byId.none || byId['view-hd'] || { id: 'none', layers: [] };
      this.intensity = 1;
      this._raf = 0;
      this.webgl = null;
      if (canvas && typeof canvas.getContext === 'function') {
        try {
          this.webgl = new FilterRenderer(canvas);
        } catch (e) {
          this.ctx = canvas.getContext('2d');
        }
      } else {
        this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      }
      this.work = typeof document !== 'undefined' ? mk(2, 2) : null;
      this.raw = typeof document !== 'undefined' ? mk(2, 2) : null;
    }
    setFilter(idOrFilter) {
      if (!idOrFilter || idOrFilter === 'none') {
        this.filter = byId.none || { id: 'none', layers: [] };
      } else if (typeof idOrFilter === 'string') {
        this.filter = byId[idOrFilter] || byId.none || { id: 'none', layers: [] };
      } else {
        this.filter = idOrFilter;
      }
    }
    setIntensity(v) { this.intensity = Math.max(0, Math.min(1, v)); }

    render(src, time = 0) {
      if (!this.canvas || !src) return;
      const w = src.videoWidth || src.naturalWidth || src.width;
      const h = src.videoHeight || src.naturalHeight || src.height;
      if (!w || !h) return;

      const f = this.filter;
      if (this.webgl) {
        const activeFilter = (!f || f.id === 'none') ? null : f;
        this.webgl.render(src, activeFilter, this.intensity, time, w, h);
        return;
      }

      const { canvas, ctx, work, raw } = this;
      if (!ctx) return;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      if (work.width !== w || work.height !== h) { work.width = w; work.height = h; raw.width = w; raw.height = h; }

      const rg = raw.getContext('2d');
      rg.clearRect(0, 0, w, h); rg.drawImage(src, 0, 0, w, h);

      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'none';
      if (!f || f.id === 'none' || this.intensity === 0) { ctx.drawImage(raw, 0, 0); return; }

      const g = work.getContext('2d');
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.clearRect(0, 0, w, h);
      if (supportsCtxFilter) g.filter = f.css || 'none';
      g.drawImage(raw, 0, 0);
      g.filter = 'none';
      for (const L of (f.layers || [])) this._layer(g, L, w, h);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;

      ctx.drawImage(raw, 0, 0);
      ctx.globalAlpha = this.intensity;
      ctx.drawImage(work, 0, 0);
      ctx.globalAlpha = 1;
    }

    _layer(g, L, w, h) {
      g.save();
      switch (L.t) {
        case 'tint':
          g.globalCompositeOperation = L.blend; g.globalAlpha = L.a;
          g.fillStyle = L.color; g.fillRect(0, 0, w, h); break;
        case 'vignette': {
          const r = Math.hypot(w, h) / 2;
          const gr = g.createRadialGradient(w / 2, h / 2, r * .35, w / 2, h / 2, r);
          gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${L.s})`);
          g.fillStyle = gr; g.fillRect(0, 0, w, h); break; }
        case 'grain': {
          g.globalCompositeOperation = 'overlay'; g.globalAlpha = L.a;
          g.fillStyle = g.createPattern(getGrain(), 'repeat'); g.fillRect(0, 0, w, h); break; }
        case 'split': {
          const dx = Math.round(w * L.dx);
          const c = mk(w, h), cg = c.getContext('2d');
          for (const [col, off] of [['#ff0040', dx], ['#00e0ff', -dx]]) {
            cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, w, h);
            cg.drawImage(this.raw, 0, 0);
            cg.globalCompositeOperation = 'multiply'; cg.fillStyle = col; cg.fillRect(0, 0, w, h);
            g.globalCompositeOperation = 'screen'; g.globalAlpha = L.a;
            g.drawImage(c, off, 0);
          }
          break; }
        case 'ghost': {
          g.globalAlpha = L.a; g.globalCompositeOperation = 'screen';
          const sw = w * L.scale, sh = h * L.scale;
          g.drawImage(this.raw, w * L.dx - (sw - w) / 2, h * L.dy - (sh - h) / 2, sw, sh); break; }
        case 'pip': {
          const pw = w * L.size, ph = h * L.size, x = w - pw, y = h - ph;
          g.drawImage(this.raw, x, y, pw, ph);
          g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, w * .006); g.strokeRect(x, y, pw, ph); break; }
        case 'filmstrip': {
          const bw = w * .08;
          g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(0, 0, bw, h);
          g.fillStyle = 'rgba(255,255,255,.75)';
          const n = 9, step = h / n, rw = bw * .5, rh = step * .45;
          for (let i = 0; i < n; i++) g.fillRect((bw - rw) / 2, i * step + (step - rh) / 2, rw, rh);
          break; }
        case 'leak': {
          g.globalCompositeOperation = 'screen'; g.globalAlpha = L.a;
          let gr = g.createRadialGradient(w * .85, h * .9, 0, w * .85, h * .9, w * .7);
          gr.addColorStop(0, 'rgba(255,190,80,.9)'); gr.addColorStop(1, 'rgba(255,190,80,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          gr = g.createRadialGradient(w * .1, h * .1, 0, w * .1, h * .1, w * .5);
          gr.addColorStop(0, 'rgba(255,80,200,.5)'); gr.addColorStop(1, 'rgba(255,80,200,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h); break; }
        case 'glow': {
          if (!supportsCtxFilter) break;
          g.globalCompositeOperation = 'screen'; g.globalAlpha = L.a;
          g.filter = `blur(${Math.round(L.blur * w / 576)}px)`;
          g.drawImage(g.canvas, 0, 0); break; }
      }
      g.restore();
    }

    start(video) {
      this.stop();
      const tick = (t) => { this.render(video, (t || performance.now()) / 1000); this._raf = requestAnimationFrame(tick); };
      this._raf = requestAnimationFrame(tick);
    }
    stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; }
  }

  async function exportVideo(video, filterId, opts = {}) {
    if (typeof document === 'undefined') return null;
    const canvas = mk(2, 2), r = new Renderer(canvas);
    r.setFilter(filterId); r.setIntensity(opts.intensity ?? 1);
    video.currentTime = opts.start ?? 0;
    await new Promise(res => { video.onseeked = res; });
    r.render(video);
    const stream = canvas.captureStream(opts.fps || 30);
    try {
      const vs = video.captureStream ? video.captureStream() : null;
      vs && vs.getAudioTracks().forEach(t => stream.addTrack(t));
    } catch (e) { /* audio optional */ }
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find(m => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m));
    if (!mime || typeof MediaRecorder === 'undefined') return null;
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: opts.bitrate || 8e6 });
    const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise(res => { rec.onstop = () => res(new Blob(chunks, { type: 'video/webm' })); });
    const end = opts.end ?? video.duration;
    rec.start(); r.start(video); await video.play();
    await new Promise(res => {
      const chk = () => (video.ended || video.currentTime >= end) ? res() : requestAnimationFrame(chk);
      chk();
    });
    video.pause(); r.stop(); rec.stop();
    return done;
  }

  const api = { FILTERS, CLASSIC, byId, isPack, nameOf, previewFilter, syncPreview, clearPreview,
    ffmpegStage, panelHtml, syncPanel, parseCss, gradeChain, Renderer, FilterRenderer, exportVideo, supportsCtxFilter, supportsWebGL,
    toggleFavorite, filterByCat, getFavorites, syncFavoritesUI };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ClipFilterPack = api;
  root.ClipFilters = api;
})(typeof window !== 'undefined' ? window : globalThis);
