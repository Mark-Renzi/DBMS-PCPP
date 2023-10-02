import pandas as pd
import json
import os
import sys
import re
import numpy as np

cpu = pd.read_json('data/json/cpu.json')

print(cpu.head())