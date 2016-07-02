import sys
import csv
import random
import numpy as np
import pdb


#####
##### Jensen-Shannon distance
##### ref: https://en.wikipedia.org/wiki/Jensen%E2%80%93Shannon_divergence
def normalize(u):
    """
    Normalize numerical array
    """
    u = np.array(u)
    return u / float(np.sum(u))

def jsd(u, v):
    """
    Jensen-Shannon Distance         :: \sqrt(J-S Divergence)
    JSD (Jensen-Shannon divergence) ::
    JSD(P || Q) = 0.5 * D_{kl}(P||M) + 0.5 * D_{kl}(Q||M)
    D_{kl} = Kullback-Leibler divergence
    """
    u1 = normalize(u) ## default conversion to np.array
    v1 = normalize(v) ## default conversion to np.array
    m = (u1 + v1) / 2
    jsDivergence = 0.5 * kld(u1, m) + 0.5 * kld(v1, m)
    return np.sqrt(jsDivergence)

def kld(p, q):
    """
    Kullback-Leibler divergence ::
    D_{kl} = \sum_{i}P(i) * log(\frac{P(i)}{Q(i)})
    """ 
    return np.sum(p * np.log(p / q))

def diceCoef(u, v):
    """
    Dice Coefficent (Sorenson Index) :: 1 - \frac{2 * \sum_i(min(u_i, v_i))}{\sum_i(u_i + v_i)}
    """
    num = 2 * np.sum([min(u[i], v[i]) for i in range(len(u))])
    denom = np.sum(np.array(u) + np.array(v))
    return 1 - (num / denom)

## Modified from build() from Stanford's CS224U
def build(src_filename, delimiter=',', header=True, quoting=csv.QUOTE_MINIMAL):
    """Reads in matrices from CSV or space-delimited files.
    
    Parameters
    ----------
    src_filename : str
        Full path to the file to read.
        
    delimiter : str (default: ',')
        Delimiter for fields in src_filename. Use delimter=' '
        for GloVe files.
        
    header : bool (default: True)
        Whether the file's first row contains column names. 
        Use header=False for GloVe files.
    
    quoting : csv style (default: QUOTE_MINIMAL)
        Use the default for normal csv files and csv.QUOTE_NONE for
        GloVe files.

    Returns
    -------
    (np.array, list of str, list of str)
       The first member is a dense 2d Numpy array, and the second 
       and third are lists of strings (row names and column names, 
       respectively). The third (column names) is None if the 
       input file has no header. The row names are assumed always 
       to be present in the leftmost column.    
    """
    reader = csv.reader(open(src_filename), delimiter=delimiter, quoting=quoting)
    colnames = None
    if header:
        colnames = next(reader)
        colnames = colnames[1: ]
    mat = []    
    rownames = []
    for line in reader:        
        rownames.append(line[0])            
        mat.append(np.array(list(map(float, line[1: ]))))
    return (np.array(mat), rownames, colnames)
