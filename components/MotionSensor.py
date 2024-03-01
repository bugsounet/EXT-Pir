from gpiozero import MotionSensor
from signal import pause
import argparse, sys

parser = argparse.ArgumentParser(
    description='Read MotionSensor state from GPIO for EXT-Pir',
    epilog="Support: https://forum.bugsounet.fr ©bugsounet 2024"
)

def gpio_check(x):
    x = int(x)
    if x < 1 or x > 21:
        raise argparse.ArgumentTypeError("GPIO must be between 1 and 21")
    return x

parser.add_argument("-g", "--gpio", help="Define GPIO", type=gpio_check, required=True)

args = parser.parse_args(None if sys.argv[1:] else ['-h'])

try:
  pir = MotionSensor("GPIO" + str(args.gpio))
  pir.when_motion = lambda: print('Detected')
  pause()
except Exception as e:
  print("Error:", e)

