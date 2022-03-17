import pandas as pd
import numpy as np

data = pd.read_csv('cleanData.csv')
data = data.sample(frac=0.01, random_state=42)

data.to_csv('smallData.csv', index=False)